import { plansRepository } from "./plans.repository";

export const plansService = {
  async findAll() {
    return plansRepository.findAllActive();
  },

  async findByCode(code: string) {
    const plan = await plansRepository.findByCode(code);

    if (!plan || !plan.isActive) {
      throw new Error("Plan not found");
    }

    return plan;
  },
};
