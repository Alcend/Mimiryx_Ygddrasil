import re

with open('src/components/WorldTree/YggdrasilWorldTreeCanvas.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix infinite recursion and implement LOD clustering
old_cluster_logic = r"""  for \(let b = 0; b < childBranchCount; b\+\+\) \{
    const slice = items\.slice\(b \* itemsPerChild, \(b \+ 1\) \* itemsPerChild\);
    if \(slice\.length === 0\) continue;

    // Wide angular distribution to prevent crossing
    const spread = \(b - \(childBranchCount - 1\) / 2\) \* \(0\.42 / Math\.pow\(1\.1, currentDepth\)\);
    const branchAngle = baseAngle \+ spread;
    const branchLength = baseLength \* \(0\.64 \+ \(b % 2 === 0 \? 0\.08 : 0\)\); // Length decay per depth

    // Compute end position
    const endP = \{
      x: parentPos\.x \+ Math\.cos\(branchAngle\) \* branchLength \* 1\.25,
      y: parentPos\.y \+ Math\.sin\(branchAngle\) \* branchLength,
    \};

    // Calculate bezier control point based on normal vector
    const dx = endP\.x - parentPos\.x;
    const dy = endP\.y - parentPos\.y;
    const len = Math\.hypot\(dx, dy\);
    const nx = -dy / len;
    const ny = dx / len;
    const curveAmount = branchLength \* 0\.25;
    const sideSign = spread >= 0 \? 1 : -1;
    const cpx = mx \+ nx \* curveAmount \* sideSign;
    const cpy = my \+ ny \* curveAmount \* sideSign - 4;

    const isLeafLevel = currentDepth >= maxDepth \|\| slice\.length === 1;

    if \(isLeafLevel && slice\.length === 1\) \{
      // Terminal note leaf
      const note = slice\[0\];
      const noteBirth = birthTSMap\.get\(note\.id\) \|\| 0;
      const progress = note\.status === 'mastered' \? 100 : note\.status === 'reviewing' \? 60 : 20;

      nodesList\.push\(\{
        id: `note-\$\{note\.id\}`,
        parentId,
        type: 'note',
        title: note\.title,
        category: topic\.name,
        topicId: topic\.id,
        noteId: note\.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth \+ 1,
        thickness: Math\.max\(1\.4, 3\.8 - currentDepth \* 0\.7\),
        color: note\.status === 'mastered' \? '#00ff88' : note\.status === 'reviewing' \? '#ffb020' : '#00f0ff',
        status: note\.status,
        mastery: progress,
        nodeRadius: 3\.8,
        pulseOffset: currentDepth \* 0\.2 \+ b \* 0\.1,
        birthTime: noteBirth,
      \}\);
    \} else \{
      // Intermediate recursive limb
      const branchId = `\$\{parentId\}-rec-\$\{currentDepth\}-\$\{b\}`;
      const limbThickness = Math\.max\(1\.8, 4\.4 - currentDepth \* 0\.85\);

      nodesList\.push\(\{
        id: branchId,
        parentId,
        type: 'subtopic',
        title: `\$\{topic\.name\} Sub-Branch \$\{b \+ 1\}`,
        category: topic\.name,
        topicId: topic\.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth \+ 1,
        thickness: limbThickness,
        color: '#00f0ff',
        status: 'learning',
        mastery: 50,
        nodeRadius: Math\.max\(3\.8, 6\.0 - currentDepth \* 0\.9\),
        pulseOffset: currentDepth \* 0\.2 \+ b \* 0\.1,
        birthTime: topicBirth,
      \}\);

      // Recurse deeper with the remaining subset of items
      generateRecursiveCluster\(
        endP,
        branchId,
        slice,
        currentDepth \+ 1,
        maxDepth,
        branchAngle,
        branchLength,
        topic,
        topicBirth,
        birthTSMap,
        nodesList
      \);
    \}
  \}"""

new_cluster_logic = """  for (let b = 0; b < childBranchCount; b++) {
    const slice = items.slice(b * itemsPerChild, (b + 1) * itemsPerChild);
    if (slice.length === 0) continue;

    // Wide angular distribution to prevent crossing
    const spread = (b - (childBranchCount - 1) / 2) * (0.42 / Math.pow(1.1, currentDepth));
    const branchAngle = baseAngle + spread;
    const branchLength = baseLength * (0.64 + (b % 2 === 0 ? 0.08 : 0)); // Length decay per depth

    // Compute end position
    const endP = {
      x: parentPos.x + Math.cos(branchAngle) * branchLength * 1.25,
      y: parentPos.y + Math.sin(branchAngle) * branchLength,
    };

    // Calculate bezier control point
    const mx = (parentPos.x + endP.x) / 2;
    const my = (parentPos.y + endP.y) / 2;
    const dx = endP.x - parentPos.x;
    const dy = endP.y - parentPos.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const curveAmount = branchLength * 0.25;
    const sideSign = spread >= 0 ? 1 : -1;
    const cpx = mx + nx * curveAmount * sideSign;
    const cpy = my + ny * curveAmount * sideSign - 4;

    // LOD Clustering: Stop recursion if depth maxed out or too many nodes
    const isLeafLevel = currentDepth >= maxDepth || slice.length === 1;

    if (slice.length === 1) {
      // Terminal note leaf
      const note = slice[0];
      const noteBirth = birthTSMap.get(note.id) || 0;
      const progress = note.status === 'mastered' ? 100 : note.status === 'reviewing' ? 60 : 20;

      nodesList.push({
        id: `note-${note.id}`,
        parentId,
        type: 'note',
        title: note.title,
        category: topic.name,
        topicId: topic.id,
        noteId: note.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth + 1,
        thickness: Math.max(1.4, 3.8 - currentDepth * 0.7),
        color: note.status === 'mastered' ? '#00ff88' : note.status === 'reviewing' ? '#ffb020' : '#00f0ff',
        status: note.status,
        mastery: progress,
        nodeRadius: 3.8,
        pulseOffset: currentDepth * 0.2 + b * 0.1,
        birthTime: noteBirth,
      });
    } else if (isLeafLevel && slice.length > 1) {
      // LOD CLUSTER NODE: Combine multiple notes into a single high-density node to save rendering overhead
      nodesList.push({
        id: `${parentId}-cluster-${b}`,
        parentId,
        type: 'subtopic',
        title: `${slice.length} Knowledge Records`,
        category: topic.name,
        topicId: topic.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth + 1,
        thickness: Math.max(1.8, 4.4 - currentDepth * 0.85),
        color: '#ffb020', // Highlight clusters in gold/amber
        status: 'learning',
        mastery: 50,
        nodeRadius: Math.max(4.0, 3.8 + (Math.log(slice.length) * 1.5)), // Dynamic size based on cluster density
        pulseOffset: currentDepth * 0.2 + b * 0.1,
        birthTime: topicBirth,
      });
    } else {
      // Intermediate recursive limb
      const branchId = `${parentId}-rec-${currentDepth}-${b}`;
      const limbThickness = Math.max(1.8, 4.4 - currentDepth * 0.85);

      nodesList.push({
        id: branchId,
        parentId,
        type: 'subtopic',
        title: `${topic.name} Sub-Branch ${b + 1}`,
        category: topic.name,
        topicId: topic.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth + 1,
        thickness: limbThickness,
        color: '#00f0ff',
        status: 'learning',
        mastery: 50,
        nodeRadius: Math.max(3.8, 6.0 - currentDepth * 0.9),
        pulseOffset: currentDepth * 0.2 + b * 0.1,
        birthTime: topicBirth,
      });

      // Recurse deeper
      generateRecursiveCluster(
        endP,
        branchId,
        slice,
        currentDepth + 1,
        maxDepth,
        branchAngle,
        branchLength,
        topic,
        topicBirth,
        birthTSMap,
        nodesList
      );
    }
  }"""

text = re.sub(old_cluster_logic, new_cluster_logic, text)

# 2. Viewport Culling logic in the render loop
old_draw_loop = r"""      for \(const n of treeNodes\) \{
        if \(\!n\.p0 \|\| !n\.p1\) continue;

        const age = Math\.max\(0, now - n\.birthTime\);
        if \(age < 10\) continue;

        const growthPhase = Math\.min\(1, age / GROWTH_DURATION\);
        const easeGrowth = 1 - Math\.pow\(1 - growthPhase, 3\);

        const curr = \{
          x: n\.p0\.x \+ \(n\.p1\.x - n\.p0\.x\) \* easeGrowth,
          y: n\.p0\.y \+ \(n\.p1\.y - n\.p0\.y\) \* easeGrowth,
        \};

        // Draw bezier branch
        ctx\.beginPath\(\);
        ctx\.moveTo\(n\.p0\.x, n\.p0\.y\);
        ctx\.quadraticCurveTo\(n\.cpx, n\.cpy, curr\.x, curr\.y\);
        ctx\.lineWidth = n\.thickness \* camera\.zoom;
        ctx\.strokeStyle = n\.type === 'root' \? `\$\{n\.color\}cc` : `\$\{n\.color\}66`;
        ctx\.stroke\(\);"""

new_draw_loop = """      // Viewport culling thresholds
      const viewW = canvas.width / camera.zoom;
      const viewH = canvas.height / camera.zoom;
      const cullPad = 200; // Extra padding to render edges before they pop in
      const minX = -camera.x - cullPad;
      const maxX = -camera.x + viewW + cullPad;
      const minY = -camera.y - cullPad;
      const maxY = -camera.y + viewH + cullPad;

      for (const n of treeNodes) {
        if (!n.p0 || !n.p1) continue;

        // Viewport Culling: Skip if completely out of bounds (optimization for 10k+ nodes)
        if (
          (n.p0.x < minX && n.p1.x < minX) || 
          (n.p0.x > maxX && n.p1.x > maxX) ||
          (n.p0.y < minY && n.p1.y < minY) || 
          (n.p0.y > maxY && n.p1.y > maxY)
        ) {
           continue; 
        }

        const age = Math.max(0, now - n.birthTime);
        if (age < 10) continue;

        const growthPhase = Math.min(1, age / GROWTH_DURATION);
        const easeGrowth = 1 - Math.pow(1 - growthPhase, 3);

        const curr = {
          x: n.p0.x + (n.p1.x - n.p0.x) * easeGrowth,
          y: n.p0.y + (n.p1.y - n.p0.y) * easeGrowth,
        };

        // Draw bezier branch
        ctx.beginPath();
        ctx.moveTo(n.p0.x, n.p0.y);
        ctx.quadraticCurveTo(n.cpx, n.cpy, curr.x, curr.y);
        ctx.lineWidth = n.thickness * camera.zoom;
        ctx.strokeStyle = n.type === 'root' ? `${n.color}cc` : `${n.color}66`;
        ctx.stroke();"""

text = re.sub(old_draw_loop, new_draw_loop, text)

# I should also fix the undefined mx and my in the old block that I might have broken
# wait, in my new block I redefined mx and my.
# Let's write the file.
with open('src/components/WorldTree/YggdrasilWorldTreeCanvas.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
