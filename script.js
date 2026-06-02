/* ==========================================================================
   1. GLOBAL SYSTEM & SPA ROUTER (전역 시스템 및 라우터)
   ========================================================================== */

// 단일 페이지 어플리케이션(SPA) 페이지 전환 라우팅 함수
function showPage(pageId) {
    $('.page').addClass('hidden');
    $('#' + pageId).removeClass('hidden');

    $('.navbar a').removeClass('active');
    $(`.navbar a[href="#${pageId}"]`).addClass('active');
    
    if (pageId === 'page3') {
        renderTasks();
    }
}

// 스크롤 방향 감지에 따른 네비게이션 헤더바 보이기/숨기기 토글
$(document).ready(function() {
    let lastScrollY = $(window).scrollTop();
    const $header = $('header');
    const scrollThreshold = 40;  // 스크롤 감지 민감도 (40px)

    $(window).on('scroll', function() {
        const currentScrollY = $(this).scrollTop();
        const scrollDelta = currentScrollY - lastScrollY;

        // 최상단 영역에서는 헤더바 무조건 노출
        if (currentScrollY < 10) {
            $header.removeClass('hide');
            return;
        }

        // 민감도 이하의 스크롤은 반응 무시
        if (Math.abs(scrollDelta) < scrollThreshold) {
            return;
        }

        // 스크롤 방향에 따른 헤더 노출 제어
        if (scrollDelta > 0) {
            $header.addClass('hide'); // 아래로 스크롤 시 숨김
        } else {
            $header.removeClass('hide'); // 위로 스크롤 시 보임
        }

        lastScrollY = currentScrollY;
    });
});


/* ==========================================================================
   2. PROFILE CARDS & INTERACTIVES (프로필 & 자기소개 플립)
   ========================================================================== */

// 자기소개 앞/뒷면 카드 뒤집기(Flip) 상호작용 제어
$(document).ready(function () {
    $('#flipBtn').click(function () {
        $('.about-flip').toggleClass('flipped');

        if ($('.about-flip').hasClass('flipped')) {
            $(this).text('자기소개 보기');
        } else {
            $(this).text('프로필 보기');
        }
    });
});


/* ==========================================================================
   3. PROJECTS CARDS SLIDER (프로젝트 카드 슬라이더)
   ========================================================================== */

// 프로젝트 가로 슬라이더 및 터치 제스처 제어
$(function () {
    const $slider = $(".project-slider");
    const $track = $slider.find(".project-track");

    // 원본 슬라이드 복제하여 무한 루프 구현
    const $originalSlides = $track.children(".project-slide");
    const totalSlides = $originalSlides.length;

    const $firstClone = $originalSlides.first().clone();
    const $lastClone = $originalSlides.last().clone();

    $track.append($firstClone);
    $track.prepend($lastClone);

    const $slides = $track.children(".project-slide");

    let currentIndex = 1;
    let slideWidth = 0;
    let isAnimating = false;

    // 슬라이더 이동 연산
    function moveSlider(animate = true) {
        slideWidth = $slides.first().outerWidth(true) || $slider.width();
        
        if (!slideWidth || slideWidth <= 0) {
            isAnimating = false;
            return;
        }

        const offset = -(currentIndex * slideWidth);
        $track.css({
            transition: animate ? "transform 0.45s ease" : "none",
            transform: `translateX(${offset}px)`
        });

        if (!animate) {
            isAnimating = false;
        }
    }

    // 다음 슬라이드 이동
    function nextSlide() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex++;
        moveSlider();
    }

    // 이전 슬라이드 이동
    function prevSlide() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex--;
        moveSlider();
    }

    // 초기값 세팅 (애니메이션 없이 1번째 슬라이드로 배치)
    moveSlider(false);

    // 네비게이션 버튼 이벤트 바인딩
    $slider.on("click", ".project-nav.next", nextSlide);
    $slider.on("click", ".project-nav.prev", prevSlide);

    // 모바일 터치 스와이프 이벤트 리스너 바인딩 (iOS/Android 네이티브 대응)
    const sliderEl = document.querySelector(".project-slider");
    if (sliderEl) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        sliderEl.addEventListener("touchstart", function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
        }, { passive: true });

        sliderEl.addEventListener("touchmove", function (e) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        sliderEl.addEventListener("touchend", function (e) {
            let diffX = touchEndX - touchStartX;
            let diffY = touchEndY - touchStartY;
            
            // X축 이동거리가 Y축보다 크고 최소 40px 스와이프된 경우 실행
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
        }, { passive: true });
    }

    // 트랜지션 애니메이션 종료 시 루프 정렬
    $track.on("transitionend", function (e) {
        if (e.target !== $track[0]) return;

        if (currentIndex === totalSlides + 1) {
            currentIndex = 1;
            moveSlider(false);
        } else if (currentIndex === 0) {
            currentIndex = totalSlides;
            moveSlider(false);
        }

        isAnimating = false;
    });

    // 화면 크기 리사이즈 대응
    $(window).on("resize", function () {
        slideWidth = $slides.first().outerWidth(true);
        moveSlider(false);
    });
});


/* ==========================================================================
   4. RETINA CANVAS SCALING ENGINE (Retina 고해상도 캔버스 제어 엔진)
   ========================================================================== */

// Retina 디스플레이 해상도 깨짐(Blur) 방지용 Canvas 물리 픽셀 버퍼 크기 보정 헬퍼
function prepareRetinaCanvas(canvasId, baseWidth, baseHeight) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    
    // 바운딩 박스(CSS 렌더링 영역 크기) 획득
    const rect = canvas.getBoundingClientRect();
    
    // 논리(Logical) 드로잉 영역 크기 연산 (비율 유지)
    const logicalWidth = rect.width > 0 ? rect.width : (window.innerWidth >= 992 ? baseWidth : baseWidth / 2);
    const logicalHeight = rect.width > 0 ? rect.width * (baseHeight / baseWidth) : (window.innerWidth >= 992 ? baseHeight : baseHeight / 2);
    
    const dpr = window.devicePixelRatio || 1;
    
    // Canvas 물리 픽셀 버퍼 해상도를 배율만큼 곱하여 확장
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    
    // CSS 가로세로 길이는 논리 크기로 세팅
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    
    // 드로잉 콘텍스트 배율 동기화
    ctx.scale(dpr, dpr);
    
    return {
        ctx: ctx,
        width: logicalWidth,
        height: logicalHeight,
        scale: logicalWidth / baseWidth
    };
}


/* ==========================================================================
   5. MIN HEAP VISUALIZER (최소 힙 알고리즘 시각화)
   ========================================================================== */

let heap = [4, 10, 12, 31, 15, 20, 25];
let heapHighlightIndex = -1;
let heapCompareIndex = -1;
let heapIsAnimating = false;

// 딜레이용 비동기 대기 유틸
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 스피드 바 연동 딜레이 시간 계산
function getHeapDelay() {
    let speed = parseInt($('#heap-speed').val());
    return (101 - speed) * 15;
}

// 최소 힙 트리 시각화 드로잉
function drawHeap() {
    const retina = prepareRetinaCanvas('heap-canvas', 720, 540);
    if (!retina) return;
    const { ctx, width, height, scale } = retina;
    
    ctx.clearRect(0, 0, width, height);
    
    if (heap.length === 0) {
        ctx.font = `${Math.round(16 * scale)}px sans-serif`;
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'center';
        ctx.fillText('힙이 비어 있습니다. 노드를 추가해 보세요.', width / 2, height / 2);
        return;
    }
    
    const levelHeight = 75 * (scale < 0.6 ? 0.75 : scale);
    const nodeRadius = Math.max(10, Math.round(18 * scale));
    const fontSize = Math.max(9, Math.round(12 * scale));
    const lineWidth = 2.5 * scale;
    
    // 각 노드 배치 좌표 연산
    let positions = [];
    for (let i = 0; i < heap.length; i++) {
        let level = Math.floor(Math.log2(i + 1));
        let levelNodesCount = Math.pow(2, level);
        let posInLevel = i - (levelNodesCount - 1);
        let x = (posInLevel + 0.5) * (width / levelNodesCount);
        let y = level * levelHeight + 40 * scale;
        positions.push({ x, y });
    }
    
    // 자식-부모 연결선 드로잉
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < heap.length; i++) {
        let leftChild = 2 * i + 1;
        let rightChild = 2 * i + 2;
        
        if (leftChild < heap.length) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[leftChild].x, positions[leftChild].y);
            ctx.stroke();
        }
        if (rightChild < heap.length) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[rightChild].x, positions[rightChild].y);
            ctx.stroke();
        }
    }
    
    // 노드 구체 및 텍스트 렌더링
    for (let i = 0; i < heap.length; i++) {
        const { x, y } = positions[i];
        
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        
        let gradient = ctx.createRadialGradient(x, y, 2, x, y, nodeRadius);
        if (i === heapHighlightIndex) {
            gradient.addColorStop(0, '#22c55e'); // 녹색 활성화
            gradient.addColorStop(1, '#16a34a');
        } else if (i === heapCompareIndex) {
            gradient.addColorStop(0, '#eab308'); // 황색 비교군
            gradient.addColorStop(1, '#d97706');
        } else {
            gradient.addColorStop(0, '#2563eb'); // 기본 블루 그라데이션
            gradient.addColorStop(1, '#7c3aed');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(heap[i], x, y + 1);
    }
}

// 힙 노드 삽입 및 Heapify Up 과정 시각화
async function insertHeapNode() {
    if (heapIsAnimating) return;
    let $input = $('#heap-input');
    let val = parseInt($input.val());
    if (isNaN(val) || val < 1 || val > 99) {
        alert("1부터 99 사이의 정수를 입력해 주세요.");
        return;
    }
    if (heap.length >= 31) {
        alert("시각화를 위해 최대 31개(5레벨)의 노드까지만 추가할 수 있습니다.");
        return;
    }
    $input.val('');
    
    heapIsAnimating = true;
    heap.push(val);
    drawHeap();
    
    let curr = heap.length - 1;
    while (curr > 0) {
        let parent = Math.floor((curr - 1) / 2);
        heapCompareIndex = parent;
        heapHighlightIndex = curr;
        drawHeap();
        await sleep(getHeapDelay());
        
        if (heap[curr] < heap[parent]) {
            // 부모 노드와 값 스왑
            let temp = heap[curr];
            heap[curr] = heap[parent];
            heap[parent] = temp;
            
            heapHighlightIndex = parent;
            heapCompareIndex = curr;
            drawHeap();
            await sleep(getHeapDelay());
            
            curr = parent;
        } else {
            break;
        }
    }
    
    heapCompareIndex = -1;
    heapHighlightIndex = -1;
    heapIsAnimating = false;
    drawHeap();
}

// 최소값(루트 노드) 추출 및 Heapify Down 과정 시각화
async function deleteHeapMin() {
    if (heapIsAnimating) return;
    if (heap.length === 0) return;
    
    heapIsAnimating = true;
    heapHighlightIndex = 0;
    drawHeap();
    await sleep(getHeapDelay());
    
    if (heap.length === 1) {
        heap.pop();
        heapHighlightIndex = -1;
        heapIsAnimating = false;
        drawHeap();
        return;
    }
    
    // 가장 끝 리프 값을 루트로 이동
    heap[0] = heap[heap.length - 1];
    heap.pop();
    heapHighlightIndex = 0;
    drawHeap();
    await sleep(getHeapDelay());
    
    let curr = 0;
    while (2 * curr + 1 < heap.length) {
        let left = 2 * curr + 1;
        let right = 2 * curr + 2;
        let smallest = left;
        
        if (right < heap.length && heap[right] < heap[left]) {
            smallest = right;
        }
        
        heapCompareIndex = smallest;
        heapHighlightIndex = curr;
        drawHeap();
        await sleep(getHeapDelay());
        
        if (heap[smallest] < heap[curr]) {
            let temp = heap[curr];
            heap[curr] = heap[smallest];
            heap[smallest] = temp;
            
            heapHighlightIndex = smallest;
            heapCompareIndex = curr;
            drawHeap();
            await sleep(getHeapDelay());
            
            curr = smallest;
        } else {
            break;
        }
    }
    
    heapCompareIndex = -1;
    heapHighlightIndex = -1;
    heapIsAnimating = false;
    drawHeap();
}

// 힙 초기화
function clearHeap() {
    if (heapIsAnimating) return;
    heap = [];
    drawHeap();
}

// 랜덤 값 5개 추가 일괄 구축
function addRandomHeapNodes() {
    if (heapIsAnimating) return;
    for (let i = 0; i < 5; i++) {
        if (heap.length >= 31) break;
        heap.push(Math.floor(Math.random() * 98) + 1);
    }
    buildMinHeap();
    drawHeap();
}

// 최소 힙 빌드 연산
function buildMinHeap() {
    let len = heap.length;
    for (let i = Math.floor(len / 2) - 1; i >= 0; i--) {
        heapifyDownSync(i);
    }
}

function heapifyDownSync(index) {
    let curr = index;
    while (2 * curr + 1 < heap.length) {
        let left = 2 * curr + 1;
        let right = 2 * curr + 2;
        let smallest = left;
        if (right < heap.length && heap[right] < heap[left]) {
            smallest = right;
        }
        if (heap[smallest] < heap[curr]) {
            let temp = heap[curr];
            heap[curr] = heap[smallest];
            heap[smallest] = temp;
            curr = smallest;
        } else {
            break;
        }
    }
}


/* ==========================================================================
   6. HASH TABLE VISUALIZER (해시 테이블 시각화)
   ========================================================================== */

let hashTableSize = 7;
let hashTable = Array.from({ length: hashTableSize }, () => []);
let hashSearchedRow = -1;
let hashSearchedIndex = -1;

// 해시 테이블 사이즈 동적 가변
function resizeHashTable(size) {
    size = parseInt(size);
    $('#hash-size-value').text(size);
    hashTableSize = size;
    clearHashTable();
}

// 테이블 정보 포맷
function clearHashTable() {
    hashTable = Array.from({ length: hashTableSize }, () => []);
    hashSearchedRow = -1;
    hashSearchedIndex = -1;
    renderHashTable();
}

// 나눗셈법 기반 기본 정수 해싱 키 매핑
function getHashCode(key) {
    return parseInt(key) % hashTableSize;
}

// 체이닝 해시 테이블 렌더링 구현
function renderHashTable() {
    const $container = $('#hash-visualization-container');
    $container.empty();
    
    for (let i = 0; i < hashTableSize; i++) {
        const $row = $('<div>').addClass('hash-row');
        const $idx = $('<div>').addClass('hash-bucket-index').text(i);
        const $chain = $('<div>').addClass('hash-chain');
        
        const list = hashTable[i];
        if (list.length === 0) {
            const $empty = $('<div>').addClass('hash-preview-node-empty').text('Empty');
            $chain.append($empty);
        } else {
            list.forEach((item, index) => {
                const $node = $('<div>').addClass('hash-node').text(item);
                if (hashSearchedRow === i && hashSearchedIndex === index) {
                    $node.addClass('searched');
                }
                $chain.append($node);
                
                if (index < list.length - 1) {
                    const $arrow = $('<div>').addClass('hash-arrow').html('&rarr;');
                    $chain.append($arrow);
                }
            });
        }
        
        $row.append($idx).append($chain);
        $container.append($row);
    }
}

// 키 삽입 (중복 방어)
function insertHashKey() {
    let $input = $('#hash-input');
    let rawVal = $input.val().trim();
    if (!rawVal) return;
    
    if (!/^\d+$/.test(rawVal)) {
        alert('정수(Integer) 값만 입력할 수 있습니다.');
        return;
    }
    
    let key = parseInt(rawVal);
    let hash = getHashCode(key);
    if (!hashTable[hash].includes(key)) {
        hashTable[hash].push(key);
    }
    
    $input.val('');
    hashSearchedRow = -1;
    hashSearchedIndex = -1;
    renderHashTable();
}

// 해시 키 탐색 및 하이라이트 애니메이션
function searchHashKey() {
    let $input = $('#hash-input');
    let rawVal = $input.val().trim();
    if (!rawVal) return;
    
    if (!/^\d+$/.test(rawVal)) {
        alert('정수(Integer) 값만 입력할 수 있습니다.');
        return;
    }
    
    let key = parseInt(rawVal);
    let hash = getHashCode(key);
    let list = hashTable[hash];
    let idx = list.indexOf(key);
    
    if (idx !== -1) {
        hashSearchedRow = hash;
        hashSearchedIndex = idx;
        renderHashTable();
        
        setTimeout(() => {
            hashSearchedRow = -1;
            hashSearchedIndex = -1;
            renderHashTable();
        }, 2000);
    } else {
        alert(`해당 키 "${key}"가 테이블에 존재하지 않습니다.`);
    }
    $input.val('');
}

// 해시 키 삭제
function deleteHashKey() {
    let $input = $('#hash-input');
    let rawVal = $input.val().trim();
    if (!rawVal) return;
    
    if (!/^\d+$/.test(rawVal)) {
        alert('정수(Integer) 값만 입력할 수 있습니다.');
        return;
    }
    
    let key = parseInt(rawVal);
    let hash = getHashCode(key);
    let list = hashTable[hash];
    let idx = list.indexOf(key);
    
    if (idx !== -1) {
        list.splice(idx, 1);
        hashSearchedRow = -1;
        hashSearchedIndex = -1;
        renderHashTable();
    } else {
        alert(`해당 키 "${key}"를 찾을 수 없어 삭제하지 못했습니다.`);
    }
    $input.val('');
}

// 랜덤 키 일괄 생성
function addRandomHashKeys() {
    for (let i = 0; i < 5; i++) {
        let randKey = Math.floor(Math.random() * 999) + 1;
        let hash = getHashCode(randKey);
        if (!hashTable[hash].includes(randKey)) {
            hashTable[hash].push(randKey);
        }
    }
    hashSearchedRow = -1;
    hashSearchedIndex = -1;
    renderHashTable();
}


/* ==========================================================================
   7. SNAKE GAME ENGINE & CONTROLS (스네이크 게임 엔진)
   ========================================================================== */

let snake = [];
let snakeDirection = { x: 1, y: 0 };
let snakeNextDirection = { x: 1, y: 0 };
let snakeFood = { x: 0, y: 0 };
let snakeScore = 0;
let snakeHighScore = 0;
let snakeGameInterval = null;
let snakeIsRunning = false;
let snakeGridCountX = 20;
let snakeGridCountY = 15;
let snakeSpeedValue = 130;

// 스네이크 캔버스 해상도 리사이즈 보정 헬퍼
function resizeSnakeCanvas() {
    prepareRetinaCanvas('snake-canvas', 720, 540);
}

// 스네이크 게임 초기 화면 드로잉
function drawSnakeGameInitial() {
    const retina = prepareRetinaCanvas('snake-canvas', 720, 540);
    if (!retina) return;
    const { ctx, width, height, scale } = retina;
    
    ctx.clearRect(0, 0, width, height);
    
    const cellSize = width / snakeGridCountX;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= snakeGridCountX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();
    }
    for (let i = 0; i <= snakeGridCountY; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
    }
    
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('게임 시작 버튼을 눌러 플레이하세요!', width / 2, height / 2);
}

// 스네이크 요소 초기화
function initSnakeGame() {
    let startCol = Math.floor(snakeGridCountX / 2);
    let startRow = Math.floor(snakeGridCountY / 2);
    snake = [
        { x: startCol, y: startRow },
        { x: startCol - 1, y: startRow },
        { x: startCol - 2, y: startRow }
    ];
    snakeDirection = { x: 1, y: 0 };
    snakeNextDirection = { x: 1, y: 0 };
    snakeScore = 0;
    $('#snake-score').text(snakeScore);
    spawnSnakeFood();
    $('#game-over-overlay').addClass('hidden');
}

// 뱀 먹이 동적 스폰 (체폭 충돌 검증)
function spawnSnakeFood() {
    let collision = true;
    while (collision) {
        snakeFood = {
            x: Math.floor(Math.random() * snakeGridCountX),
            y: Math.floor(Math.random() * snakeGridCountY)
        };
        collision = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === snakeFood.x && snake[i].y === snakeFood.y) {
                collision = true;
                break;
            }
        }
    }
}

// 게임 일시정지 및 재시작 스위치
function toggleSnakeGame() {
    if (snakeIsRunning) {
        clearInterval(snakeGameInterval);
        snakeIsRunning = false;
        $('#snake-start-btn').text('게임 시작');
    } else {
        if (snake.length === 0) {
            initSnakeGame();
        }
        snakeIsRunning = true;
        $('#snake-start-btn').text('일시 정지');
        runSnakeLoop();
    }
}

function resetSnakeGame() {
    clearInterval(snakeGameInterval);
    snakeIsRunning = false;
    $('#snake-start-btn').text('게임 시작');
    initSnakeGame();
    drawSnake();
}

function changeSnakeSpeed(val) {
    snakeSpeedValue = parseInt(val);
    if (snakeIsRunning) {
        clearInterval(snakeGameInterval);
        runSnakeLoop();
    }
}

function changeSnakeGridSize(val) {
    let size = parseInt(val);
    snakeGridCountX = size;
    snakeGridCountY = Math.round(size * 0.75); // 4:3 고정 종횡비
    resetSnakeGame();
}

function runSnakeLoop() {
    let delay = 300 - snakeSpeedValue;
    if (delay < 35) delay = 35;
    snakeGameInterval = setInterval(updateSnakeGame, delay);
}

// 매 프레임 게임 틱 물리 연산
function updateSnakeGame() {
    if (!snakeIsRunning || snake.length === 0) return;
    
    snakeDirection = snakeNextDirection;
    let head = snake[0];
    if (!head) return;
    
    let newHead = { x: head.x + snakeDirection.x, y: head.y + snakeDirection.y };
    
    // 벽 충돌 검증
    if (newHead.x < 0 || newHead.x >= snakeGridCountX || newHead.y < 0 || newHead.y >= snakeGridCountY) {
        handleSnakeGameOver();
        return;
    }
    
    // 자기 몸체 충돌 검증
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
            handleSnakeGameOver();
            return;
        }
    }
    
    snake.unshift(newHead);
    
    // 먹이 섭식 여부 검증
    if (snakeFood && newHead.x === snakeFood.x && newHead.y === snakeFood.y) {
        snakeScore += 10;
        $('#snake-score').text(snakeScore);
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            $('#snake-highscore').text(snakeHighScore);
        }
        spawnSnakeFood();
    } else {
        snake.pop();
    }
    
    drawSnake();
}

function handleSnakeGameOver() {
    clearInterval(snakeGameInterval);
    snakeIsRunning = false;
    $('#snake-start-btn').text('게임 시작');
    $('#final-score').text(snakeScore);
    $('#game-over-overlay').removeClass('hidden');
    snake = [];
}

// 스네이크 및 배경 판넬 그리깅
function drawSnake() {
    const retina = prepareRetinaCanvas('snake-canvas', 720, 540);
    if (!retina) return;
    const { ctx, width, height } = retina;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!snakeFood) return;
    
    const cellSize = width / snakeGridCountX;
    
    // 그리드 보조 격자선 드로잉
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= snakeGridCountX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();
    }
    for (let i = 0; i <= snakeGridCountY; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
    }
    
    // 사과 먹이 구체화
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    let foodRadius = cellSize / 2 - 2;
    ctx.arc(snakeFood.x * cellSize + cellSize / 2, snakeFood.y * cellSize + cellSize / 2, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(snakeFood.x * cellSize + cellSize / 2 + 1, snakeFood.y * cellSize + cellSize / 2 - foodRadius + 1, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 뱀 몸통 및 머리 상세 드로잉
    snake.forEach((part, index) => {
        let isHead = index === 0;
        let gap = 1;
        let x = part.x * cellSize + gap;
        let y = part.y * cellSize + gap;
        let size = cellSize - gap * 2;
        
        ctx.fillStyle = isHead ? '#2563eb' : '#4f46e5';
        ctx.beginPath();
        
        if (isHead) {
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 이동방향에 동기화된 뱀 안구(Eye) 디테일링
            ctx.fillStyle = '#ffffff';
            let eyeSize = size / 5;
            if (snakeDirection.x !== 0) {
                ctx.beginPath();
                ctx.arc(x + size / 2 + snakeDirection.x * 2, y + size / 3, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + size / 2 + snakeDirection.x * 2, y + 2 * size / 3, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(x + size / 3, y + size / 2 + snakeDirection.y * 2, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + 2 * size / 3, y + size / 2 + snakeDirection.y * 2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.rect(x, y, size, size);
            ctx.fill();
        }
    });
}

// 스네이크 키보드 입력 매핑 수집
$(document).keydown(function(e) {
    if (currentSandboxProjectIndex !== 2 || !snakeIsRunning) return;
    
    let key = e.which;
    
    if ((key === 37 || key === 65) && snakeDirection.x !== 1) { // Left / A
        snakeNextDirection = { x: -1, y: 0 };
        e.preventDefault();
    } else if ((key === 38 || key === 87) && snakeDirection.y !== 1) { // Up / W
        snakeNextDirection = { x: 0, y: -1 };
        e.preventDefault();
    } else if ((key === 39 || key === 68) && snakeDirection.x !== -1) { // Right / D
        snakeNextDirection = { x: 1, y: 0 };
        e.preventDefault();
    } else if ((key === 40 || key === 83) && snakeDirection.y !== -1) { // Down / S
        snakeNextDirection = { x: 0, y: 1 };
        e.preventDefault();
    }
});

// 모바일 D-pad 전용 방향 할당
function handleMobileDirection(dir) {
    if (!snakeIsRunning) return;
    
    if (dir === 'left' && snakeDirection.x !== 1) {
        snakeNextDirection = { x: -1, y: 0 };
    } else if (dir === 'up' && snakeDirection.y !== 1) {
        snakeNextDirection = { x: 0, y: -1 };
    } else if (dir === 'right' && snakeDirection.x !== -1) {
        snakeNextDirection = { x: 1, y: 0 };
    } else if (dir === 'down' && snakeDirection.y !== -1) {
        snakeNextDirection = { x: 0, y: 1 };
    }
}


/* ==========================================================================
   8. TASK MANAGEMENT SYSTEM (LocalStorage 과제 관리 시스템)
   ========================================================================== */

let tasks = [];
let taskFilter = 'all'; 

// 시스템 시간 연동 예제 데이터 생성기
function getInitialTasks() {
    const now = new Date();
    
    // 현재시간 기준 각각 +7일, +2일 설정
    const deadlineDS = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadlineOS = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    return [
        {
            id: 'task_init_1',
            subject: '자료구조',
            title: '텀 프로젝트',
            deadline: deadlineDS.toISOString(),
            notes: '지금까지 배운 알고리즘 래퍼런스 코드 중 한가지를 선택하고, 해당 코드에 대한 최적화 보고서 작성',
            completed: false
        },
        {
            id: 'task_init_2',
            subject: '웹프로그래밍',
            title: '기말고사 대체 과제',
            deadline: deadlineOS.toISOString(),
            notes: 'SPA를 활용한 자기소개 및 나만의 웹 페이지 제작',
            completed: false
        }
    ];
}

// LocalStorage 로딩
function loadTasks() {
    const stored = localStorage.getItem('antigravity_tasks');
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch (e) {
            tasks = getInitialTasks();
            saveTasks();
        }
    } else {
        tasks = getInitialTasks();
        saveTasks();
    }
}

// LocalStorage 쓰기
function saveTasks() {
    localStorage.setItem('antigravity_tasks', JSON.stringify(tasks));
}

// 마감기한 D-Day/D+ 연산 처리
function calculateDDay(deadlineISO) {
    const deadline = new Date(deadlineISO);
    const now = new Date();
    
    const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = deadlineDate.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // 당일인 경우 구체 시간 오버플로우 확인
        if (deadline.getTime() < now.getTime()) {
            return { text: 'D+0', class: 'overdue' };
        } else {
            return { text: 'D-Day', class: 'urgent' };
        }
    } else if (diffDays > 0) {
        return { text: `D-${diffDays}`, class: diffDays <= 3 ? 'urgent' : 'coming' };
    } else {
        return { text: `D+${Math.abs(diffDays)}`, class: 'overdue' };
    }
}

// 과제 뷰 동적 드로잉
function renderTasks() {
    loadTasks();
    
    const $list = $('#task-list');
    if (!$list.length) return;
    $list.empty();
    
    let filteredTasks = tasks;
    if (taskFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (taskFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }
    
    // Dashboard 요약 수치 보정
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    
    $('#total-count').text(totalCount);
    $('#pending-count').text(pendingCount);
    $('#completed-count').text(completedCount);
    
    if (filteredTasks.length === 0) {
        $list.html('<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #888; background: var(--surface); border: 1px solid var(--line); border-radius: 20px;">표시할 과제가 없습니다. 새 과제를 추가해 보세요!</div>');
        return;
    }
    
    filteredTasks.forEach(task => {
        const ddayInfo = task.completed ? { text: '완료됨', class: 'completed' } : calculateDDay(task.deadline);
        
        const $card = $('<div>').addClass('task-card');
        if (task.completed) {
            $card.addClass('completed');
        }
        
        const $header = $('<div>').addClass('task-card-header');
        const $subTag = $('<div>').addClass('task-subject-tag').text(task.subject);
        const $ddayBadge = $('<div>').addClass(`d-day-badge ${ddayInfo.class}`).text(ddayInfo.text);
        
        $header.append($subTag).append($ddayBadge);
        
        const $body = $('<div>').addClass('task-card-body');
        const $title = $('<h4>').addClass('task-card-title').text(task.title);
        $body.append($title);
        
        if (task.notes && task.notes.trim() !== "") {
            const $notes = $('<p>').addClass('task-card-notes').text(task.notes);
            $body.append($notes);
        }
        
        const $actions = $('<div>').addClass('task-card-actions');
        
        const toggleText = task.completed ? '진행중으로' : '완료';
        const toggleBtnClass = task.completed ? 'task-toggle-btn completed-state' : 'task-toggle-btn';
        const $toggleBtn = $('<button>')
            .addClass(toggleBtnClass)
            .text(toggleText)
            .attr('onclick', `toggleTaskStatus('${task.id}')`);
            
        const $deleteBtn = $('<button>')
            .addClass('task-delete-btn')
            .text('삭제')
            .attr('onclick', `deleteTask('${task.id}')`);
            
        $actions.append($toggleBtn).append($deleteBtn);
        $card.append($header).append($body).append($actions);
        $list.append($card);
    });
}

// 새 과제 생성 등록
function handleAddTask(e) {
    e.preventDefault();
    
    const subject = $('#task-subject').val().trim();
    const title = $('#task-title').val().trim();
    const deadlineVal = $('#task-deadline').val();
    const notes = $('#task-notes').val().trim();
    
    if (!subject || !title || !deadlineVal) return;
    
    const newTask = {
        id: 'task_' + Date.now(),
        subject: subject,
        title: title,
        deadline: new Date(deadlineVal).toISOString(),
        notes: notes,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    
    $('#task-form')[0].reset();
    renderTasks();
}

// 상태 토글
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// 과제 데이터 삭제 (확인 얼럿 팝업 분기)
function deleteTask(id) {
    if (confirm('이 과제를 삭제하시겠습니까?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// 대시보드 상태 필터 세팅
function setTaskFilter(filter) {
    taskFilter = filter;
    $('.filter-btn').removeClass('active');
    
    if (filter === 'all') {
        $('.filter-btn').eq(0).addClass('active');
    } else if (filter === 'pending') {
        $('.filter-btn').eq(1).addClass('active');
    } else if (filter === 'completed') {
        $('.filter-btn').eq(2).addClass('active');
    }
    
    renderTasks();
}


/* ==========================================================================
   9. INITIALIZER & EVENT BOOTSTRAP (초기화 및 이벤트 부트스트랩)
   ========================================================================== */

let currentSandboxProjectIndex = 0;

// 샌드박스 탭 전환 제어
function selectSandboxProject(index) {
    if (index !== 2 && snakeIsRunning) {
        toggleSnakeGame();
    }

    currentSandboxProjectIndex = index;
    
    $('.sandbox-tab').removeClass('active');
    $('.sandbox-tab').eq(index).addClass('active');
    
    $('.sandbox-content').removeClass('active');
    $('.sandbox-content').eq(index).addClass('active');
    
    if (index === 0) {
        drawHeap();
    } else if (index === 1) {
        renderHashTable();
    } else if (index === 2) {
        resizeSnakeCanvas();
        drawSnakeGameInitial();
    }
}

// 앱 구동 초기 진입 리스너
$(document).ready(function() {
    // iOS 및 Apple 모바일 환경 탭 피드백(:active) 지연 시간 단축 대응
    document.addEventListener("touchstart", function() {}, { passive: true });
    
    // 1번째 샌드박스(Min Heap) 디폴트 기동
    selectSandboxProject(0);
    
    // 모바일 D-pad 더블 탭 확대 락 방지용 CSS 세팅
    $('.control-btn').css('touch-action', 'manipulation');
    
    // 과제 데이터 갱신 로드
    loadTasks();

    // 해시 테이블 데모 데이터 5개 선 탑재
    const initKeys = [12, 25, 8, 31, 44];
    initKeys.forEach(k => {
        let h = getHashCode(k);
        hashTable[h].push(k);
    });

    // 전역 창크기 변경 시 Canvas 물리 픽셀 드로잉 보정 갱신
    $(window).on("resize", function() {
        if (currentSandboxProjectIndex === 0) {
            drawHeap();
        } else if (currentSandboxProjectIndex === 2) {
            resizeSnakeCanvas();
            if (!snakeIsRunning) {
                drawSnakeGameInitial();
            } else {
                drawSnake();
            }
        }
    });
});
