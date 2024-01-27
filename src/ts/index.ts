import { Game } from "./game";
console.log('vaya')

const nLayersInput = document.querySelector("nLayersInput") as HTMLInputElement;
        nLayersInput.oninput = () => {
            nLayersInput!.nextElementSibling!.innerHTML = nLayersInput.value
        }
const g = new Game(3);