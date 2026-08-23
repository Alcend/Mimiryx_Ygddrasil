import re
from collections import defaultdict

# Read the error log (I'll pass the string directly or run tsc inside the script)
import subprocess

def fix_unused():
    print("Running tsc...")
    result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True)
    output = result.stdout
    
    # regex to match TS6133 for variables and imports
    # Example: src/pages/AIAgentPage.tsx(6,3): error TS6133: 'Bot' is declared but its value is never read.
    pattern = re.compile(r"^(src/[^:]+)\((\d+),\d+\): error TS6133: '([^']+)' is declared but its value is never read\.", re.MULTILINE)
    
    file_removals = defaultdict(list)
    
    for match in pattern.finditer(output):
        filepath = match.group(1)
        line_num = int(match.group(2))
        symbol = match.group(3)
        file_removals[filepath].append((line_num, symbol))
        
    for filepath, removals in file_removals.items():
        print(f"Fixing {filepath}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Sort removals by line number descending so modifying lines doesn't shift indices for same-line removals
            removals.sort(key=lambda x: x[0], reverse=True)
            
            for line_num, symbol in removals:
                idx = line_num - 1
                line = lines[idx]
                
                # Check if it's an import statement
                if "import" in line or "from" in line or "{" in line or "}" in line:
                    # Remove the symbol, taking care of commas
                    # Regex to remove symbol and optional surrounding commas/spaces
                    # Cases:
                    # ' Symbol, ' -> ' '
                    # ', Symbol' -> ''
                    # '{ Symbol }' -> '{ }'
                    
                    new_line = re.sub(r',\s*' + re.escape(symbol) + r'\b', '', line)
                    if new_line == line:
                        new_line = re.sub(r'\b' + re.escape(symbol) + r'\s*,', '', line)
                    if new_line == line:
                        new_line = re.sub(r'\b' + re.escape(symbol) + r'\b', '', line)
                    
                    # Cleanup empty braces import { } from '...'
                    if re.search(r'\{\s*\}', new_line):
                        new_line = '' # Just delete the whole line if braces are empty
                        # wait, what if it was the only import but no braces? E.g. import Symbol from 'x'. Then line doesn't have {}
                        
                    if "import" in line and not "{" in line and new_line.strip().startswith("import from"):
                        new_line = ''
                    
                    lines[idx] = new_line
                else:
                    # It's a local variable. Just comment it out or leave it if it's destructured
                    if "const [" in line or "let " in line or "const " in line:
                        # E.g. const [showHint, setShowHint] = useState(...)
                        # E.g. const { activityLogs } = ...
                        # It's safer to just comment the line if the whole line is basically just that variable
                        pass # too complex to safely regex local variables without AST
                        
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    fix_unused()
