import { AnalysisRunRepository } from '@domain/repositories/analysis-run.repository';

export const createMockAnalysisRunRepository = () => {
  return {
    startOrSkip: jest.fn(),
    save: jest.fn(),
    findByStatus: jest.fn(),
    findById: jest.fn(),
  } as unknown as AnalysisRunRepository;
};
