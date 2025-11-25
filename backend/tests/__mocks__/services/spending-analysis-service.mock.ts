import { SpendingAnalysisService } from '@domain/services/spending-analysis.service';

export const createMockSpendingAnalysisService = () => {
  return {
    analyzePeriod: jest.fn(),
    analyzeCategory: jest.fn(),
  } as unknown as SpendingAnalysisService;
};
