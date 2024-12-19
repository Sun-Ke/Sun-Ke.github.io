Reveal.initialize({
    controls: true,     // 显示演示文稿控制箭头
    progress: true,
    history: true,
    center: true,
    slideNumber: true,  // 显示当前幻灯片的页码
    shuffle: false,     // 每次演示加载时随机化幻灯片的顺序
    loop: false,        // 循环演示
    showNotes: false,   // 如果演讲者的笔记应该对所有观众可见，则标记
    // 过渡风格 无/淡入/滑动/凸出/凹入/缩放
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    // 过渡速度 默认/快速/慢
    transitionSpeed: 'default', // default/fast/slow
    // 整页幻灯片背景的过渡样式 无/淡入/滑动/凸出/凹入/缩放
    backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom
    katex: {
        local: '..',
    },
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealMath.KaTeX]
});

// 代码拖动
document.addEventListener("DOMContentLoaded", function () {
    const codeBlocks = document.querySelectorAll(".reveal pre code");

    codeBlocks.forEach((codeBlock) => {
        let isDragging = false;
        let startX, startY;
        let scrollLeft, scrollTop;

        codeBlock.addEventListener("mousedown", (e) => {
            isDragging = true;
            codeBlock.classList.add("active");
            startX = e.pageX - codeBlock.offsetLeft;
            startY = e.pageY - codeBlock.offsetTop;
            scrollLeft = codeBlock.scrollLeft;
            scrollTop = codeBlock.scrollTop;
            codeBlock.style.cursor = 'grabbing';
        });

        document.addEventListener("mouseleave", () => {
            if (isDragging) {
                isDragging = false;
                codeBlock.classList.remove("active");
                codeBlock.style.cursor = 'grab';
            }
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                codeBlock.classList.remove("active");
                codeBlock.style.cursor = 'grab';
            }
        });

        codeBlock.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - codeBlock.offsetLeft;
            const y = e.pageY - codeBlock.offsetTop;
            const walkX = (x - startX) * 1; // 调整水平拖动速度
            const walkY = (y - startY) * 1; // 调整垂直拖动速度
            codeBlock.scrollLeft = scrollLeft - walkX;
            codeBlock.scrollTop = scrollTop - walkY;
        });

        // 触摸设备支持
        codeBlock.addEventListener("touchstart", (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - codeBlock.offsetLeft;
            startY = e.touches[0].pageY - codeBlock.offsetTop;
            scrollLeft = codeBlock.scrollLeft;
            scrollTop = codeBlock.scrollTop;
        });

        codeBlock.addEventListener("touchend", () => {
            isDragging = false;
        });

        codeBlock.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - codeBlock.offsetLeft;
            const y = e.touches[0].pageY - codeBlock.offsetTop;
            const walkX = (x - startX) * 1; // 调整水平拖动速度
            const walkY = (y - startY) * 1; // 调整垂直拖动速度
            codeBlock.scrollLeft = scrollLeft - walkX;
            codeBlock.scrollTop = scrollTop - walkY;
        });
    });
});