import { supabase } from "../lib/supabase";
import { createScenario, createDialogue } from "../services/scenarios";

async function insertSampleData() {
  try {
    console.log("Starting to insert sample data...");

    // Sample scenarios and dialogues data
    const scenariosData = [
      {
        title: "Make Plans",
        description: "Practice making social plans and coordinating activities with friends or colleagues.",
        dialogues: [
          {
            title: "Making Weekend Plans",
            persona_tags: ["friendly", "casual"],
            difficulty: "easy",
            scoring_categories: ["clarity", "socialAwareness"],
            placeholders: [],
            steps: []
          }
        ]
      },
      {
        title: "Meet Someone New",
        description: "Learn how to introduce yourself and start conversations with new people in various social settings.",
        dialogues: [
          {
            title: "Meeting a New Colleague",
            persona_tags: ["professional", "friendly"],
            difficulty: "medium",
            scoring_categories: ["clarity", "socialAwareness", "empathy"],
            placeholders: [],
            steps: []
          }
        ]
      },
      {
        title: "Ask For Help",
        description: "Practice requesting assistance in different situations while maintaining confidence and clarity.",
        dialogues: [
          {
            title: "Asking for Help at Work",
            persona_tags: ["professional", "helpful"],
            difficulty: "medium",
            scoring_categories: ["clarity", "selfAdvocacy", "assertiveness"],
            placeholders: [],
            steps: []
          }
        ]
      },
      {
        title: "Handle Conflict",
        description: "Develop skills for managing disagreements and conflicts in a constructive manner.",
        dialogues: [
          {
            title: "Handling Constructive Feedback",
            persona_tags: ["direct", "professional"],
            difficulty: "hard",
            scoring_categories: ["empathy", "assertiveness", "socialAwareness"],
            placeholders: [],
            steps: []
          }
        ]
      },
      {
        title: "Job Interview",
        description: "Prepare for job interviews with practice scenarios covering common questions and situations.",
        dialogues: [
          {
            title: "Job Interview Practice",
            persona_tags: ["professional", "evaluative"],
            difficulty: "hard",
            scoring_categories: ["clarity", "assertiveness", "selfAdvocacy"],
            placeholders: [],
            steps: []
          }
        ]
      }
    ];

    // Insert scenarios and their dialogues
    for (const scenarioData of scenariosData) {
      console.log(`Creating scenario: ${scenarioData.title}`);
      
      // Create scenario
      const scenario = await createScenario({
        title: scenarioData.title,
        description: scenarioData.description
      });

      console.log(`✓ Created scenario: ${scenario.title} (ID: ${scenario.id})`);

      // Create dialogues for this scenario
      for (const dialogueData of scenarioData.dialogues) {
        console.log(`  Creating dialogue: ${dialogueData.title}`);
        
        const dialogue = await createDialogue({
          scenario_id: scenario.id,
          title: dialogueData.title,
          persona_tags: dialogueData.persona_tags,
          difficulty: dialogueData.difficulty,
          scoring_categories: dialogueData.scoring_categories,
          placeholders: dialogueData.placeholders,
          steps: dialogueData.steps
        });

        console.log(`  ✓ Created dialogue: ${dialogue.title} (ID: ${dialogue.id})`);
      }
    }

    console.log("\n🎉 Successfully inserted all sample data!");
    
    // Verify the data was inserted
    const { data: scenarios, error } = await supabase
      .from("scenarios")
      .select(`
        *,
        dialogues:dialogues(*)
      `);

    if (error) {
      console.error("Error fetching verification data:", error);
    } else {
      console.log("\n📊 Verification - Current scenarios in database:");
      scenarios?.forEach(scenario => {
        console.log(`- ${scenario.title} (${scenario.dialogues?.length || 0} dialogues)`);
      });
    }

  } catch (error) {
    console.error("❌ Error inserting sample data:", error);
    throw error;
  }
}

// Execute the script
insertSampleData()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });