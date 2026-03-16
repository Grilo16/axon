export const createActionHandler = <TArg, TResult>(
  mutationTrigger: (arg: TArg) => { unwrap: () => Promise<TResult> },
  options?: { successMessage?: string; errorMessage?: string }
) => {
  return async (arg: TArg): Promise<TResult> => {
    try {
      const result = await mutationTrigger(arg).unwrap();
      
      if (options?.successMessage) {
        console.log(`✅ Success: ${options.successMessage}`); 
      }
      
      return result;
    } catch (error: unknown) {
      if (options?.errorMessage) {
        console.error(`❌ Error: ${options.errorMessage}`, error);
      }
      throw error;
    }
  };
};