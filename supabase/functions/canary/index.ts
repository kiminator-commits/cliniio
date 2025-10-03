// Create two new files under supabase/functions/canary
// ⚠️ STRICT INSTRUCTION FOR CURSOR:
// DO NOT MODIFY ANY OTHER FILES.
// DO NOT MODIFY JSX.
// DO NOT TOUCH STATE LOGIC, STYLING, OR BEHAVIOR.
// DO NOT ADD OR REMOVE ANY COMPONENTS OR VARIABLES NOT LISTED BELOW.
// DO NOT COMMIT OR PUSH CHANGES.
// DO NOT CHANGE UI.
// DO NOT RENAME ANYTHING.
// DO NOT REFORMAT CODE UNLESS EXPLICITLY INSTRUCTED.
// DO NOT RUN LINT OR FIX ERRORS UNLESS EXPLICITLY REQUESTED.
// ONLY PERFORM THE SPECIFIC EDIT REQUESTED IN THIS PROMPT.

// File: supabase/functions/canary/index.ts

// Deno types for Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

Deno.serve(() => new Response('canary-ok'));
