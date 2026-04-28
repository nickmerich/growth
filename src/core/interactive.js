import { createInterface } from 'node:readline';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function runInteractive(pluginName, skill) {
  if (!skill.steps || skill.steps.length === 0) {
    console.error(`Skill "${skill.name}" does not support interactive mode.`);
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin });
  const lines = [];
  rl.on('line', (line) => lines.push(line));
  await new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve();
    } else {
      rl.on('close', resolve);
    }
  });

  let lineIndex = 0;
  function getAnswer(question) {
    if (process.stdin.isTTY) {
      return new Promise((resolve) => {
        process.stdout.write(`  ${question}\n  > `);
        const ttyRl = createInterface({ input: process.stdin });
        ttyRl.once('line', (line) => {
          ttyRl.close();
          resolve(line.trim());
        });
      });
    }
    return Promise.resolve((lines[lineIndex++] || '').trim());
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${skill.title} — Interactive Walkthrough`);
  console.log(`${'='.repeat(60)}\n`);

  const answers = {};

  for (let i = 0; i < skill.steps.length; i++) {
    const step = skill.steps[i];
    console.log(`\n--- Step ${i + 1}/${skill.steps.length}: ${step.label} ---`);
    console.log(`${step.guidance}\n`);

    for (const p of step.prompts) {
      const answer = await getAnswer(p.question);
      answers[p.key] = answer;
      if (!process.stdin.isTTY) {
        console.log(`  ${p.question}`);
        console.log(`  > ${answer}\n`);
      } else {
        console.log('');
      }
    }
  }

  if (!process.stdin.isTTY) {
    rl.close();
  }

  const doc = generateDocument(pluginName, skill, answers);
  const dir = join(process.cwd(), 'growth-docs');
  await mkdir(dir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${skill.name}-${timestamp}.md`;
  const filepath = join(dir, filename);
  await writeFile(filepath, doc);

  console.log(`\n${'='.repeat(60)}`);
  console.log('  Document saved!');
  console.log(`  ${filepath}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(doc);
}

function generateDocument(pluginName, skill, answers) {
  const lines = [];
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  lines.push(`# ${skill.title}`);
  lines.push(`*Generated on ${date} using growth/${pluginName}*\n`);
  lines.push('---\n');

  for (const step of skill.steps) {
    lines.push(`## ${step.label}\n`);
    lines.push(`${step.guidance}\n`);

    for (const p of step.prompts) {
      const answer = answers[p.key] || '*(not answered)*';
      lines.push(`**${p.question}**`);
      lines.push(`${answer}\n`);
    }
  }

  lines.push('---\n');
  lines.push(`*Created with growth CLI — ${pluginName}/${skill.name}*\n`);

  return lines.join('\n');
}
