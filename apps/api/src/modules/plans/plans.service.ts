import { plansRepository } from "./plans.repository";
import type { Plan } from "@prisma/client";

function serializePlan(plan: Plan) {
  return {
    ...plan,
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: plan.yearlyPrice != null ? Number(plan.yearlyPrice) : null,
  };
}

export const plansService = {
  async findAllActive() {
    const plans = await plansRepository.findAllActive();
    return plans.map(serializePlan);
  },

  async findByCode(code: string) {
    const plan = await plansRepository.findByCode(code);
    if (!plan || !plan.isActive) {
      throw new Error("Plan not found");
    }
    return serializePlan(plan);
  },

  async findById(id: string) {
    const plan = await plansRepository.findById(id);
    if (!plan) {
      throw new Error("Plan not found");
    }
    return serializePlan(plan);
  },
};
