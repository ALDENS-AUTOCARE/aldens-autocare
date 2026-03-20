CREATE UNIQUE INDEX "SubscriptionUsage_subscriptionId_periodKey_usageType_key"
ON "SubscriptionUsage"("subscriptionId", "periodKey", "usageType");