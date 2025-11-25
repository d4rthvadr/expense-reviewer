export function createMockAgentService() {
  return {
    generateAIResponse: jest.fn().mockResolvedValue('AI-generated review text'),
  };
}
