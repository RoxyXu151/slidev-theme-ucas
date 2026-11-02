import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { main } from '../.agents/skills/ucas-slidev/scripts/verify_pptx.mjs'

export { verifyPptx } from '../.agents/skills/ucas-slidev/scripts/verify_pptx.mjs'

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
