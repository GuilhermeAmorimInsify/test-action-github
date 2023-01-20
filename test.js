name: 'Check Unit Tests in PR'
on:
  pull_request_target:
    types:
      - opened
      - synchronize
      - reopened
jobs:
  clean-pr:
    runs-on: self-hosted
    steps:
      - name: Check for unit tests
        uses: actions/github-script@v6
        with:
          script: |
            const fileList = (await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number,
            })).data;
            console.log(fileList);
            const tsFiles = fileList
              .map((file) => file.filename)
              .filter((file) => file.endsWith('.ts') && !file.includes('automated-tests'));
            if (tsFiles.length == 0) {
                console.log('No TS files, but I will be watching.');
                return;
            } 
            const testFiles = [];
            const codeFiles = [];
            for (const file of tsFiles) {
              if (file.endsWith('.spec.ts')) {
                testFiles.push(file.replace(/\.spec\.ts$/, '.ts'));
              } else {
                codeFiles.push(file);
              }
            }
            const withoutTests = codeFiles.filter((file) => !testFiles.includes(file));
            let comment;
            if (withoutTests.length > 0) {
              const snarkyComments = [
                'Hey! You forgot the unit tests!',
                "Machines might be replacing us, but they won't be writing unit tests for you (they need your example).",
                "I'm you from the the future, I don't have time to explain, write unit tests!",
                "I'm sorry Dave, I'm afraid you forgot the unit tests.",
                "With great code, comes great unit testing.",
                '"I will write unit tests, I will write unit tests, I will write unit tests..." - Bart Simpsom',
                "To be fair, this script is not unit tested, don't let your code be like me",
                'The first rule of the code club: You write unit tests',
                'Hoston, we have a problem...',
                'My name is Test, Unit Test.',
                '"I will be back" - This code being deployed in production without unit tests.',
                "I see dead people. But I don't see unit tests.",
                "Dude, where's my unit code?",
                "Where's my unit tests, Lebowski?",
                "In case I don't see ya: good morning, good evening and write unit tests.",
                '"Look mom! Without unit tests!" - Famous last words.',
                'Without unit tests you might end up creating Skynet accidentaly. This is not a good thing.',
                'Maybe the person that will have to fix the bugs is a psycopath that knows where you live.',
                '"I think you missed a stop over there" - Stacy\'s mom, but she\'s not impressed.'
              ];
              comment = `${snarkyComments[Math.floor(Math.random() * snarkyComments.length)]}\n\nPotential files:\n- ${withoutTests.join("\n- ")}\n\nIf tests already exist to these files, ignore me.`;
            } else {
              const niceComments = [
                'May the Clean Code be with you.',
                'This is the stuff that the dreams are made of.',
                'Made it ma! Top of the world!',
                'Another future weekend saved!',
                'Uncle Bob is proud!',
                "Nice one! Now you need to solve all the other reviews. At least they won't complain about missing unit tests, right?",
                'If I wasn\'t a script I would buy you a Doner!',
                "You deserve a Doner today!",
                "Hope the spec files aren't empty! Otherwise, nice job!",
                'Imagine all the people, writing unit tests! U u u u u!',
                'Hope you get a "LGTM" soon!',
                "At least you won't get a snarky comment from me!",
                ':frog-yay:',
                'Perfection!',
                'Me gusta mucho!',
                'Super lekker, super moi!'
              ];
              comment = `${niceComments[Math.floor(Math.random() * niceComments.length)]}\n\nApparently you created tests to all your files, keep it up!\n\n(I'm not checking the quality of the tests, but your collegues will.)`;
            }
            await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.number,
                body: comment
              });
