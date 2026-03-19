#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const scriptDir = __dirname;
const apiRoot = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(scriptDir, "..", "..", "..");
const migrationsDir = path.resolve(apiRoot, "database", "migrations");
const migrationsTable = "schema_migrations";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const command = argv[0] || "up";
  const options = {
    all: false,
    to: null,
  };

  for (const arg of argv.slice(1)) {
    if (arg === "--all") {
      options.all = true;
      continue;
    }

    if (arg.startsWith("--to=")) {
      options.to = arg.slice("--to=".length);
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { command, options };
}

function getMigrationFiles(direction) {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const suffix = direction === "up" ? ".up.sql" : ".down.sql";
  return fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith(suffix))
    .sort();
}

function downFileForUp(upFileName) {
  return upFileName.replace(/\.up\.sql$/, ".down.sql");
}

async function ensureMigrationsTable(connection) {
  await connection.query(
    `
    CREATE TABLE IF NOT EXISTS ${migrationsTable} (
      filename VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (filename)
    ) ENGINE=InnoDB;
    `
  );
}

async function getAppliedMigrations(connection) {
  const [rows] = await connection.query(
    `
    SELECT filename
    FROM ${migrationsTable}
    ORDER BY filename ASC
    `
  );

  return rows.map((row) => row.filename);
}

async function runSqlFile(connection, fileName) {
  const absolutePath = path.resolve(migrationsDir, fileName);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Migration file not found: ${absolutePath}`);
  }

  const sql = fs.readFileSync(absolutePath, "utf8");
  await connection.query(sql);
}

function printUsage() {
  console.log("Usage:");
  console.log("  node scripts/migrate.js up [--to=<file.up.sql>]");
  console.log("  node scripts/migrate.js down [--all]");
  console.log("  node scripts/migrate.js status");
}

async function migrateUp(connection, options) {
  const allUp = getMigrationFiles("up");
  const applied = new Set(await getAppliedMigrations(connection));

  let targetFiles = allUp;
  if (options.to) {
    const targetIndex = allUp.indexOf(options.to);
    if (targetIndex === -1) {
      throw new Error(`Target migration not found: ${options.to}`);
    }
    targetFiles = allUp.slice(0, targetIndex + 1);
  }

  const pending = targetFiles.filter((name) => !applied.has(name));

  if (pending.length === 0) {
    console.log("No pending up migrations.");
    return;
  }

  for (const fileName of pending) {
    console.log(`Applying ${fileName} ...`);
    await runSqlFile(connection, fileName);
    await connection.query(
      `
      INSERT INTO ${migrationsTable} (filename, applied_at)
      VALUES (?, NOW())
      `,
      [fileName]
    );
    console.log(`Applied ${fileName}`);
  }
}

async function migrateDown(connection, options) {
  const applied = await getAppliedMigrations(connection);
  if (applied.length === 0) {
    console.log("No applied migrations to roll back.");
    return;
  }

  const ordered = applied.slice().reverse();
  const targets = options.all ? ordered : [ordered[0]];

  for (const upFile of targets) {
    const downFile = downFileForUp(upFile);
    console.log(`Rolling back ${upFile} using ${downFile} ...`);
    await runSqlFile(connection, downFile);
    await connection.query(
      `
      DELETE FROM ${migrationsTable}
      WHERE filename = ?
      `,
      [upFile]
    );
    console.log(`Rolled back ${upFile}`);
  }
}

async function showStatus(connection) {
  const upFiles = getMigrationFiles("up");
  const applied = new Set(await getAppliedMigrations(connection));

  if (upFiles.length === 0) {
    console.log("No migration files found.");
    return;
  }

  let appliedCount = 0;
  for (const fileName of upFiles) {
    const marker = applied.has(fileName) ? "applied" : "pending";
    if (marker === "applied") {
      appliedCount += 1;
    }
    console.log(`[${marker}] ${fileName}`);
  }

  console.log("");
  console.log(`Applied: ${appliedCount}`);
  console.log(`Pending: ${upFiles.length - appliedCount}`);
}

async function main() {
  loadEnvFile(path.resolve(workspaceRoot, ".env"));
  loadEnvFile(path.resolve(apiRoot, ".env"));

  const { command, options } = parseArgs(process.argv.slice(2));
  if (!["up", "down", "status"].includes(command)) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aldens_autocare",
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(connection);

    if (command === "up") {
      await migrateUp(connection, options);
    } else if (command === "down") {
      await migrateDown(connection, options);
    } else {
      await showStatus(connection);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Migration runner failed:", error.message);
  process.exitCode = 1;
});
