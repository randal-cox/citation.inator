# Learning-site design

The first deliverable is an editable Markdown citation beside its rendered result. Source, records and configuration must stay synchronized; an invalid edit marks the result stale and disables downloads. Reset restores the complete example. The host sanitizes compiled HTML and supplies the cache directly to the inspector.

Use a light notebook palette: mist `#f4f7fb`, ink `#182c44`, cyan `#007f9e`, violet `#6548a3`, and borders `#c6d5e2`. Interface type uses the system sans serif, reading output Georgia and source a system monospace. Keep the existing citation.inator icon. Give the source and result equal space on wide screens and stack them on phones. No marketing hero or arbitrary content-width caps.

The control row distinguishes CSS appearance, citation Style and Hover behavior. Progressive examples introduce one idea at a time. Detailed explanations belong beside examples in tutorials; the playground retains concise controls, useful state and actionable errors.

Build only an explicit public allowlist into `site/`. Core lessons compile locally without network requests. Private manuscripts never enter this build. Give learning its own reader-preference storage key. Test the generated site under a project subdirectory as well as locally.
