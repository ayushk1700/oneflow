// Original ONEFLOW reflections. No scraped or falsely attributed quotations.
import fs from 'node:fs/promises';
const thoughts = [
 'You do not have to do it all today.', 'One small step is still a step.', 'Make room for the work that matters.', 'Your attention is a place you can return to.', 'Let the next thing be a simple thing.',
 'A quiet beginning can carry a whole day.', 'You can begin again from right here.', 'Progress does not always make a sound.', 'A little care changes ordinary work.', 'Give one thing your undivided attention.',
 'Leave a little space between your plans.', 'Some days, showing up is the work.', 'Your pace can belong to you.', 'The first draft only needs to exist.', 'An ordinary moment can hold a fresh start.',
 'Clarity often arrives while you are working.', 'Finish one small thing before opening another.', 'Rest belongs in a meaningful day.', 'The important work deserves a little quiet.', 'You are allowed to learn as you go.',
 'A gentle routine can be a kind of freedom.', 'Notice what is already moving forward.', 'Choose a direction before choosing a speed.', 'There is value in doing less with care.', 'Let curiosity make the first move.',
 'A difficult task can begin with an easy step.', 'Make your next promise a manageable one.', 'Your best work needs room to breathe.', 'Small beginnings do not need big announcements.', 'A clear surface can invite a clear thought.',
 'You can be patient and purposeful at once.', 'The day is more than its unfinished list.', 'Let enough be a real destination.', 'Attention grows where you choose to place it.', 'A pause can help you find the next sentence.',
 'Work can be steady without being hurried.', 'Bring a little kindness to the unfinished parts.', 'Every practice contains an imperfect beginning.', 'What you repeat becomes a path.', 'A thoughtful no makes room for a meaningful yes.',
 'There is no need to race your own life.', 'Start with the part you understand.', 'A small act of courage can look like opening a page.', 'Protect a little time for what makes you feel alive.', 'You can set a burden down and return later.',
 'Today can be useful without being extraordinary.', 'You do not need certainty to take a careful step.', 'The smallest useful action is worth taking.', 'A focused hour begins with a single choice.', 'Leave yourself a kind place to begin tomorrow.'
];
const invitations = [
 'Take one unhurried breath.', 'Let this moment be a beginning.', 'Keep a little room for surprise.', 'Notice the good in something ordinary.', 'Return to what is in front of you.',
 'Allow yourself a moment of quiet.', 'Choose the next step with care.', 'Let your shoulders soften.', 'Remember that you can change your pace.', 'Carry a little patience with you.'
];
const quotes = thoughts.flatMap((thought, i) => invitations.map((invitation, j) => ({ id: `oneflow-${i*10+j+1}`, text: `${thought} ${invitation}`, author: 'ONEFLOW · A daily thought' })));
await fs.writeFile('data/quotes.json', JSON.stringify(quotes, null, 2) + '\n');
console.log(`Wrote ${quotes.length} original, locally bundled reflections.`);
