// 文件路径配置对象
const scripts = [
    { local: "/slides/p5js/scripts/p5.min.js", online: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.js" },
    { local: "/slides/p5js/scripts/dat.gui.min.js", online: "https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.9/dat.gui.min.js" },
    // { local: "/p5js/scripts/p5.sound.min.js", online: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/addons/p5.sound.min.js" },
];
// ?online=1
const isOnline = new URLSearchParams(window.location.search).get('online') === '1';
// console.log("isOnline " + isOnline);
scripts.forEach(script => {
    const scriptElement = document.createElement('script');
    scriptElement.src = isOnline ? script.online : script.local;
    document.head.appendChild(scriptElement);
});