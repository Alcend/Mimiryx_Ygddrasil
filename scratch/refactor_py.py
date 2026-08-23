import os

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* Knowledge Flow State & Mastery (from Analytics) */}' in line:
        start_idx = i
    if '{/* Streak Badge */}' in line:
        # We want to replace everything up to the end of the Streak Badge
        # Let's find the closing div for Streak Badge
        for j in range(i, len(lines)):
            if '</div>' in lines[j] and '}' in lines[j+1] and ')' in lines[j+1]:
                end_idx = j + 2
                break
        if end_idx != -1:
            break

print("Start:", start_idx, "End:", end_idx)

if start_idx != -1 and end_idx != -1:
    import_lines = [
        "import { KnowledgeDistribution } from '../components/dashboard/KnowledgeDistribution';\n"
    ]
    
    # insert import
    for i, line in enumerate(lines):
        if "import { sounds } from '../utils/audio';" in line:
            lines.insert(i + 1, import_lines[0])
            break

    # Re-calculate indices after insertion
    start_idx += 1
    end_idx += 1

    replacement = """
            {/* Knowledge Flow State & Mastery (from Analytics) */}
            {(activeSideTab === 'all' || activeSideTab === 'analytics') && (
              <KnowledgeDistribution
                learningNotes={learningNotes}
                reviewingNotes={reviewingNotes}
                masteredNotes={masteredNotes}
                totalNotesCount={totalNotesCount}
                masteryPercentage={masteryPercentage}
                topics={topics}
                notes={notes}
              />
            )}
"""
    lines[start_idx:end_idx] = [replacement]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced!")
else:
    print("Not found")
