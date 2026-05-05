const typeFont = document.querySelectorAll(".tf");
const tfContainers = document.querySelectorAll(".tfcontainer");
const letters = "ABCDEFGHIJKLMNOPRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const delay = 5;

window.onload = () => {
    typeFont.forEach(anchor => {
        const text = anchor.dataset.value;
        const textArray = JSON.parse(text);
        textAnimation(anchor, textArray, 0);
    });
};

tfContainers.forEach(container => {
    let isAnimating = false;

    container.onmouseover = e => {
        if (isAnimating) return;

        const tfElement = container.classList.contains("tf") 
            ? container 
            : container.querySelector(".tf");
        
        if (!tfElement) return;

        const text = tfElement.dataset.value;
        const textArray = JSON.parse(text);
        const currentIndex = textArray.indexOf(tfElement.innerText);
        const startIndex = currentIndex !== -1 ? currentIndex + 1 : 0;

        isAnimating = true;
        textAnimation(tfElement, textArray, startIndex, () => {
            isAnimating = false;
        });
    };
});

function textAnimation(target, textArray, startIndex, callback) {
    let iteration = 0;
    let count = startIndex;
    let interval;

    if (count >= textArray.length) count = 0;
    const newText = textArray[count];

    interval = setInterval(() => {
        target.innerText = newText.split("")
            .map((letter, index) => {
                if (index < iteration / delay || letter === " ") {
                    return newText[index];
                }
                return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("");

        if (iteration === newText.length * delay) {
            clearInterval(interval);
            if (callback) callback();
        }
        iteration += 1;
    }, 10);
}
