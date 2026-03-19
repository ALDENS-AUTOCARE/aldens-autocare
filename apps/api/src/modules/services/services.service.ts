import { servicesRepository } from "./services.repository";

export const servicesService = {
  async findAll() {
    return servicesRepository.findAllActive();
  },

  async findOneBySlug(slug: string) {
    const service = await servicesRepository.findBySlug(slug);

    if (!service || !service.isActive) {
      throw new Error("Service not found");
    }

    return service;
  },

  async findActiveById(id: string) {
    const service = await servicesRepository.findById(id);

    if (!service || !service.isActive) {
      throw new Error("Service not found");
    }

    return service;
  },
};

