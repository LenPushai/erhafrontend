# Read the file
with open('src/pages/rfq/RFQEdit.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace the Actions Required section
output = []
skip_until_closing = False
skip_count = 0

for i, line in enumerate(lines):
    if 'Actions Required' in line and '<label' in line:
        # Found the start - add the label
        output.append(line)
        # Add the working checkbox pattern from RFQCreate
        output.append('                      <div className="d-flex flex-wrap gap-3">\n')
        output.append('                        {enums?.actionsRequired?.map(opt => (\n')
        output.append('                          <div key={opt.value} className="form-check">\n')
        output.append('                            <input\n')
        output.append('                              type="checkbox"\n')
        output.append('                              className="form-check-input"\n')
        output.append('                              id={`edit-action-${opt.value}`}\n')
        output.append('                              checked={formData.actionsRequired.includes(opt.value)}\n')
        output.append('                              onChange={(e) => {\n')
        output.append('                                const current = formData.actionsRequired;\n')
        output.append('                                if (e.target.checked) {\n')
        output.append('                                  setFormData(prev => ({ ...prev, actionsRequired: [...current, opt.value] }));\n')
        output.append('                                } else {\n')
        output.append('                                  setFormData(prev => ({ ...prev, actionsRequired: current.filter(v => v !== opt.value) }));\n')
        output.append('                                }\n')
        output.append('                              }}\n')
        output.append('                            />\n')
        output.append('                            <label className="form-check-label" htmlFor={`edit-action-${opt.value}`}>\n')
        output.append('                              {opt.label}\n')
        output.append('                            </label>\n')
        output.append('                          </div>\n')
        output.append('                        ))}\n')
        output.append('                      </div>\n')
        output.append('                    </div>\n')
        skip_until_closing = True
        skip_count = 0
        continue
    
    if skip_until_closing:
        # Count closing divs
        if '</div>' in line:
            skip_count += 1
            # After 3 closing divs, we're done with the Actions Required section
            if skip_count >= 3:
                skip_until_closing = False
        continue
    
    output.append(line)

# Write back
with open('src/pages/rfq/RFQEdit.tsx', 'w', encoding='utf-8') as f:
    f.writelines(output)

print('✅ RFQEdit.tsx FIXED with working checkbox pattern from RFQCreate!')