export function createMockReviewGenerationService() {
  return {
    generateReview: jest.fn().mockResolvedValue('AI-generated review text'),
  };
}
