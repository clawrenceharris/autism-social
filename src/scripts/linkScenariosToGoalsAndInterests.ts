import { supabase } from "../lib/supabase";

async function linkScenariosToGoalsAndInterests() {
  try {
    console.log("Starting to link scenarios to goals and interests...");

    // Get all scenarios
    const { data: scenarios, error: scenariosError } = await supabase
      .from("scenarios")
      .select("id, title");

    if (scenariosError) throw scenariosError;

    // Get all goals and interests
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("id, goal");

    const { data: interests, error: interestsError } = await supabase
      .from("interests")
      .select("id, name");

    if (goalsError) throw goalsError;
    if (interestsError) throw interestsError;

    // Define scenario mappings
    const scenarioMappings = [
      {
        title: "Make Plans",
        goals: ["Build friendships", "Improve workplace communication"],
        interests: ["Sports", "Movies", "Travel", "Gaming"]
      },
      {
        title: "Meet Someone New",
        goals: ["Build confidence in social situations", "Develop networking abilities", "Build friendships"],
        interests: ["Technology", "Art", "Music", "Reading/Writing"]
      },
      {
        title: "Ask For Help",
        goals: ["Improve workplace communication", "Build confidence in social situations", "Learn to set boundaries"],
        interests: ["Technology", "Science", "Fitness"]
      },
      {
        title: "Handle Conflict",
        goals: ["Learn conflict resolution", "Improve workplace communication", "Learn to set boundaries"],
        interests: ["Meditation", "Reading/Writing", "History"]
      },
      {
        title: "Job Interview",
        goals: ["Practice job interview skills", "Build confidence in social situations", "Develop leadership skills"],
        interests: ["Technology", "Science", "Art", "Business"]
      }
    ];

    // Link scenarios to goals and interests
    for (const mapping of scenarioMappings) {
      const scenario = scenarios?.find(s => s.title === mapping.title);
      if (!scenario) {
        console.log(`⚠️ Scenario "${mapping.title}" not found, skipping...`);
        continue;
      }

      console.log(`\nLinking scenario: ${scenario.title}`);

      // Link goals
      for (const goalName of mapping.goals) {
        const goal = goals?.find(g => g.goal === goalName);
        if (goal) {
          const { error } = await supabase
            .from("scenario_goals")
            .insert({
              scenario_id: scenario.id,
              goal_id: goal.id
            });

          if (error && error.code !== '23505') { // Ignore unique constraint violations
            console.error(`Error linking goal "${goalName}":`, error);
          } else {
            console.log(`  ✓ Linked to goal: ${goalName}`);
          }
        }
      }

      // Link interests
      for (const interestName of mapping.interests) {
        const interest = interests?.find(i => i.name === interestName);
        if (interest) {
          const { error } = await supabase
            .from("scenario_interests")
            .insert({
              scenario_id: scenario.id,
              interest_id: interest.id
            });

          if (error && error.code !== '23505') { // Ignore unique constraint violations
            console.error(`Error linking interest "${interestName}":`, error);
          } else {
            console.log(`  ✓ Linked to interest: ${interestName}`);
          }
        }
      }
    }

    console.log("\n🎉 Successfully linked all scenarios to goals and interests!");

    // Verify the linkages
    const { data: verification, error: verifyError } = await supabase
      .from("scenarios")
      .select(`
        title,
        scenario_goals(goals(goal)),
        scenario_interests(interests(name))
      `);

    if (verifyError) {
      console.error("Error fetching verification data:", verifyError);
    } else {
      console.log("\n📊 Verification - Scenario linkages:");
      verification?.forEach(scenario => {
        const goalCount = scenario.scenario_goals?.length || 0;
        const interestCount = scenario.scenario_interests?.length || 0;
        console.log(`- ${scenario.title}: ${goalCount} goals, ${interestCount} interests`);
      });
    }

  } catch (error) {
    console.error("❌ Error linking scenarios:", error);
    throw error;
  }
}

// Execute the script
linkScenariosToGoalsAndInterests()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });