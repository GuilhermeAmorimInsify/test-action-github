const fileList = github.rest.pulls.listFiles({
  owner: context.repo.owner,
  repo: context.repo.repo,
  pull_number: context.payload.pull_request.number,
});
const tsFiles = fileList
  .map((file) => file.filename)
  .filter((file) => file.endsWith(".ts") && !file.contains("automated-tests"));
const testFiles = [];
const codeFiles = [];
for (const file of tsFiles) {
  if (file.endsWith(".spec.ts")) {
    testFiles.push(file.replace(/\.spec\.ts$/, ".ts"));
  } else {
    codeFiles.push(file);
  }
}
const withoutTests = codeFiles.filter((file) => !testFiles.contains(file));
if (withoutTests.length > 0) {
  const snarkyComments = [
    "Hey! You forgot the unit tests!",
    "Machines might be replacing us, but they won't be writing unit tests for you (they need your example).",
    "I'm you from the the future, I don't have time to explain, write unit tests!",
    "I'm sorry Dave, I'm afraid you forgot the unit tests.",
    "Uh-oh! You forgot the unit tests, Martijn will make go kayaking... without the kayak.",
    "With great code, comes great unit testing.",
    '"I will write unit tests, I will write unit tests, I will write unit tests..." - Bart Simpsom',
    "To be fair, this script is not unit tested, don't let your code be like me",
    "The first rule of the code club: You write unit tests",
    "Imagine all the people, writing unit tests! U u u u u!",
    "Hoston, we have a problem...",
    "My name is Test, Unit Test.",
    '"I will be back" - This code being deployed in production without unit tests.',
    "I see dead people. But I don't see unit tests.",
    "Dude, where's my unit code?",
    "Where's my unit tests, Lebowski?",
    "In case I don't see ya: good morning, good evening and write unit tests.",
  ];
  const comment = `${
    snarkyComments[math.floor(math.random() * snarkyComments.length)]
  }\n\nPotential files:\n- ${withoutTests.join("\n- ")}`;
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.number,
    body: comment,
  });
} else {
  console.log("Nice job!");
}