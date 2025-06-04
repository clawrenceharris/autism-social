import { useState, useEffect } from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type { Dialogue } from "../../types";
import { DialoguesPanel, DialogueForm } from "../../components";
import { useParams } from "react-router-dom";
import { getDialogueById } from "../../services/scenarios";
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const { dialogueId } = useParams<{ dialogueId: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [dialogueError, setDialogueError] = useState<string | null>(null);
  useEffect(() => {
    if (!dialogueId) {
      setDialogue(null);
      return;
    }
    const fetchDialogue = async () => {
      try {
        const dialogue = await getDialogueById(dialogueId);
        if (dialogue) setDialogue(dialogue);
      } catch (err) {
        setDialogueError("Could not load this Dialogue.");
      }
    };
    fetchDialogue();
  }, [dialogueId]);

  if (loading) {
    return <div className="content-centered-absolute">Loading...</div>;
  }
  if (error || dialogueError) {
    return (
      <div className="content-centered-absolute">
        An error occured: {error || dialogueError}
      </div>
    );
  }
  if (!scenario) {
    return (
      <div className="content-centered-absolute">
        404 Error: Scenario not found.
      </div>
    );
  }
  if (!dialogue) {
    return <DialoguesPanel scenario={scenario} />;
  }
  return (
    <div>
      <div className="flex-content">
        <div className="fixed">
          <h1>Edit Scenario</h1>
          <p>
            {" "}
            <small>ID: {scenario.id}</small>
          </p>
          <ScenarioForm dailogue={dialogue} scenario={scenario} />
        </div>
        <DialogueForm
          steps={[
            {
              id: "step_g24im626w",
              npc: "Hey! You must be my new roommate. I'm Sarah.",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "comment-on-room",
                  scoreChanges: ["socialAwareness"],
                  label: "Hi Sarah, I'm [Your Name]. Nice to meet you!",
                },
                {
                  event: "CHOOSE_2",
                  next: "comment-on-room",
                  scoreChanges: [],
                  label: "[Your Name]. Hey.",
                },
                {
                  event: "CHOOSE_3",
                  next: "explain-struggle",
                  scoreChanges: [],
                  label: "*stares blankly*",
                },
              ],
            },
            {
              id: "step_z1nyf5ik7",
              npc: "What do you think of the room?",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "offer-help",
                  scoreChanges: ["clarity", "socialAwareness"],
                  label: "It's bigger than I expected! Plenty of space.",
                },
                {
                  event: "CHOOSE_2",
                  next: "offer-help",
                  scoreChanges: [],
                  label: "It's okay. A bit messy.",
                },
                {
                  event: "CHOOSE_3",
                  next: "offer-help",
                  scoreChanges: [],
                  label: "It's a room.",
                },
              ],
            },
            {
              id: "step_samf01u0n",
              npc: "I'm still unpacking. It's a bit of a disaster!",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "common-interest",
                  scoreChanges: ["empathy", "socialAwareness"],
                  label: "Do you need any help with that?",
                },
                {
                  event: "CHOOSE_2",
                  next: "common-interest",
                  scoreChanges: [],
                  label: "Okay.",
                },
                {
                  event: "CHOOSE_3",
                  next: "common-interest",
                  scoreChanges: [],
                  label: "I'll unpack my stuff first.",
                },
              ],
            },
            {
              id: "step_4kllm2yxz",
              npc: "I'm studying Biology. What's your major?",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "end-conversation",
                  scoreChanges: ["clarity", "socialAwareness"],
                  label: "I'm studying Computer Science. Do you like animals?",
                },
                {
                  event: "CHOOSE_2",
                  next: "end-conversation",
                  scoreChanges: [],
                  label: "Computer Science.",
                },
                {
                  event: "CHOOSE_3",
                  next: "end-conversation",
                  scoreChanges: [],
                  label: "Um... science stuff.",
                },
              ],
            },
            {
              id: "step_mwqf71wlb",
              npc: "Cool! Well, I should probably get back to unpacking. It was nice meeting you, [Your Name].",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "end",
                  scoreChanges: ["socialAwareness"],
                  label: "You too, Sarah. See you around!",
                },
                {
                  event: "CHOOSE_2",
                  next: "end",
                  scoreChanges: [],
                  label: "Bye.",
                },
                {
                  event: "CHOOSE_3",
                  next: "end",
                  scoreChanges: [],
                  label: "*nods head*",
                },
              ],
            },
            {
              id: "step_67p2bhspe",
              npc: "Are you okay? You seem a little... quiet.",
              options: [
                {
                  event: "CHOOSE_1",
                  next: "comment-on-room",
                  scoreChanges: ["selfAdvocacy", "socialAwareness"],
                  label:
                    "Sorry, sometimes it takes me a little longer to respond. I'm [Your Name], nice to meet you.",
                },
                {
                  event: "CHOOSE_2",
                  next: "comment-on-room",
                  scoreChanges: [],
                  label: "I'm fine. Just tired.",
                },
                {
                  event: "CHOOSE_3",
                  next: "comment-on-room",
                  scoreChanges: [],
                  label: "*remains silent*",
                },
              ],
            },
            {
              id: "step_1zrazpskf",
              npc: "",
              options: [],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ScenarioPage;
