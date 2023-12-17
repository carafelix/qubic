import { CLI_Game } from "./index.ts";
import inquirer, { Answers } from "inquirer";


async function main() {
    await inquirer.prompt([{
        type: 'confirm',
        name: 'toBeDelivered',
        message: 'Is this for delivery?',
        default: false,
        transformer: (answer:Answers) => (answer ? '👍' : '👎'),
      },])
}

main();