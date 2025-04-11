

import { createClient } from "@supabase/supabase-js";
import * as Tone from "tone";

const supabase = createClient("https://uytyxroguktgsymkkoke.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dHl4cm9ndWt0Z3N5bWtrb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDc2MDQsImV4cCI6MjA1ODIyMzYwNH0.Yn6-gOjT3ZRJvAaO-czhb0IME5JP5g2IEi97TbAA_BU");


let mediaRecorder;
let recordingStream;
let allChunks = [];
let isRecording = false;


// 🔄 页面加载时加载泡泡
window.onload = function () {
    console.log("📌 页面加载完成，加载 Supabase 泡泡数据...");
    loadBubblesFromSupabase();
};

// ✅ 加载泡泡
export async function loadBubblesFromSupabase() {
    const { data, error } = await supabase
        .from("dreams")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("❌ 加载 Supabase 数据失败:", error);
        return;
    }

    data.forEach((bubble) => {
        createBubble(bubble.id, bubble.text, bubble.audio_base64);
    });
}

// ✅ 存入 Supabase
export async function saveBubbleToSupabase(text, audioBase64 = null) {
    if (!text || text.trim() === "") {
        console.error("❌ 不能存入空白文本！");
        return;
    }

    const { data, error } = await supabase.from("dreams").insert([
        {
            text: text,
            audio_base64: audioBase64,
            created_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        console.error("❌ 插入失败:", error);
    } else {
        console.log("✅ 插入成功:", data);
    }
}

// ✅ 创建泡泡
export function createBubble(docId, text, audioBase64 = null) {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.dataset.docId = docId;

    if (!audioBase64) {
        bubble.textContent = text;
    } else {
        const audioElement = document.createElement("audio");
        audioElement.src = audioBase64;
        audioElement.controls = true;
        bubble.appendChild(audioElement);
    }

    // 删除按钮
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await supabase.from("dreams").delete().eq("id", docId);
        bubble.remove();
    });
    bubble.appendChild(deleteBtn);

    // 随机位置 + 浮动动画
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    document.getElementById("bubbleContainer").appendChild(bubble);
}

// 🎤 开始录音
export function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        recordingStream = stream;
        allChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        isRecording = true;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) allChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(allChunks, { type: "audio/webm" });
            const text = document.getElementById("bubbleText").value.trim();
            processAudioWithTone(blob, text);
        };

        mediaRecorder.start(5000);
    });
}

// 🎤 停止录音
export function stopRecording() {
    if (mediaRecorder && isRecording) {
        isRecording = false;
        mediaRecorder.stop();
        recordingStream.getTracks().forEach((track) => track.stop());
    }
}

// 🔊 Tone.js 效果处理
async function processAudioWithTone(blob, text) {
    await Tone.start();


    // Step 1: 把 blob 转成 arrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Step 2: 为了获取 duration，先在主 context 里 decode 一次
    const tempBuffer = await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);
    const duration = Math.max(tempBuffer.duration + 1, 1); // 保证至少 1 秒，避免报错

    // Step 3: 进入 Offline 渲染
    const renderedBuffer = await Tone.Offline(async ({ transport }) => {
        // 在 Offline context 内重新 decode（不能用 tempBuffer）
        const buffer = await Tone.context.decodeAudioData(arrayBuffer);

        const userPitch = parseFloat(document.getElementById("pitchSlider").value);
        const userReverbTime = parseFloat(document.getElementById("reverbSlider").value);
        const userBitDepth = parseInt(document.getElementById("bitSlider").value);
        const userDelayTime = parseFloat(document.getElementById("delaySlider").value);

        const player = new Tone.Player(buffer);
        const pitch = new Tone.PitchShift({ pitch: userPitch });
        const bit = new Tone.BitCrusher(userBitDepth);
        const delay = new Tone.FeedbackDelay(userDelayTime);
        const reverb = new Tone.Reverb({ decay: userReverbTime });

        // 链接节点
        player.chain(pitch, bit, delay, reverb, Tone.Destination);

        player.start(0);
        transport.start();
    }, duration); // ✅ 这里才真正用上 duration

    const processedBlob = await bufferToWavBlob(renderedBuffer);

    // 🛡️ 检查 Blob 是否成功
    if (!processedBlob || !(processedBlob instanceof Blob)) {
      console.error("❌ 生成的音频 Blob 无效");
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(processedBlob);
    reader.onloadend = async () => {
      const base64 = reader.result;
      await saveBubbleToSupabase(text, base64);
    };
};




// ✅ 将 AudioBuffer 转为 WAV Blob
function bufferToWavBlob(audioBuffer) {
    return new Promise((resolve) => {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length * numChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];

        for (let i = 0; i < numChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, "RIFF");
        view.setUint32(4, length - 8, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, length - 44, true);

        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let j = 0; j < numChannels; j++) {
                let sample = Math.max(-1, Math.min(1, channels[j][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        resolve(new Blob([view], { type: "audio/wav" }));
    });
}

/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    getDocs // <-- this is important
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";


// 🔥 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCa4PyEJPxS6Yavfc-f-SxlYvq_6yOUngQ",
    authDomain: "dream-fde5e.firebaseapp.com",
    projectId: "dream-fde5e",
    storageBucket: "dream-fde5e.appspot.com",
    messagingSenderId: "509764309119",
    appId: "1:509764309119:web:20191ff663598d0eb1ef4a",
    measurementId: "G-7VPXZGEQ00"
};

// 🚀 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("✅ Firebase 初始化完成");

let mediaRecorder;
let recordingStream;
let allChunks = [];
let isRecording = false;

// **监听 Firestore，并生成泡泡（但不存入 Firestore）**
onSnapshot(collection(db, "dream_bubbles"), (snapshot) => {
    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
            // retrieve doc id + data
            const docId = change.doc.id;           // <--- doc ID from Firestore
            const data = change.doc.data();

            console.log("📌 Firestore 新增数据:", data);

            createBubble(docId, data.text, data.audioBase64);
        }
    });
}); 


async function bufferToBlob(audioBuffer) {
    console.log("🔄 进入 `bufferToBlob()`，开始处理音频...");
    let processedBlob = await bufferToWavBlob(audioBuffer);
    return processedBlob;
}

function bufferToWavBlob(audioBuffer) {
    return new Promise(resolve => {
        console.log("📌 直接使用 JavaScript 处理 WAV，不使用 Worker");

        // 获取音频数据
        let numOfChannels = audioBuffer.numberOfChannels,
            length = audioBuffer.length * numOfChannels * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [];

        let sampleRate = audioBuffer.sampleRate;

        // 写入 WAV 头部
        let writeString = function (view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, "RIFF");
        view.setUint32(4, 32 + length, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2 * numOfChannels, true);
        view.setUint16(32, numOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, length - 44, true);

        for (let i = 0; i < numOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let j = 0; j < numOfChannels; j++) {
                let sample = Math.max(-1, Math.min(1, channels[j][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        // 创建 WAV Blob
        let blob = new Blob([view], { type: "audio/wav" });
        console.log("✅ WAV 处理完成，大小:", blob.size);
        resolve(blob);
    });
}



// 🎤 **存入 Firestore**
export async function saveBubbleToFirestore(text, audioBase64 = null) {
    if (!text || text.trim() === "") {
        console.error("❌ 不能存入空白文本！");
        return;
    }

    console.log("📤 尝试存入 Firestore:", { text, audioBase64 });

    try {
        const docRef = await addDoc(collection(db, "dream_bubbles"), {
            text: text,
            audioBase64: audioBase64,
            timestamp: new Date()
        });

        console.log("✅ 文档成功存入 Firestore，ID:", docRef.id);
    } catch (error) {
        console.error("❌ Firestore 存储失败:", error);
    }
}

// **🔥 点击按钮 → 存入 Firestore**
document.getElementById("bubbleBtn").addEventListener("click", async () => {
    const text = document.getElementById("bubbleText").value.trim();
    if (!text) {
        console.error("❌ 用户输入为空，不存入 Firestore");
        return;
    }

    console.log("📌 用户输入:", text);

    // 🔥 只存入 Firestore，不直接生成泡泡
    await saveBubbleToFirestore(text, null);
});


// 🎵 让 `dreamscript.js` 作为一个 ES6 模块
export function createBubble(docId, text, audioBase64 = null) {
    if (!text || typeof text !== "string" || text.trim() === "") {
        console.error("❌ createBubble() 失败：text 不能为空");
        return;
    }

    console.log("🟢 生成泡泡，文本:", text, " docId:", docId);

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    // We'll store the docId in bubble.dataset for easy reference
    bubble.dataset.docId = docId;

    // If there's no audio, show text
    if (!audioBase64) {
        bubble.textContent = text;
    } else {
        // If there's audio, create an <audio> element
        const audioElement = document.createElement("audio");
        audioElement.src = audioBase64;
        audioElement.controls = true;
        audioElement.style.width = "120px";
        bubble.appendChild(audioElement);
    }

    // (Optional) add a small "Delete" button or an "X" in the corner
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";         // or an icon of your choice
    deleteBtn.style.marginLeft = "5px";  // simple styling
    deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // so we don't trigger bubble clicks
        deleteBubbleDoc(docId, bubble);
    });
    bubble.appendChild(deleteBtn);

    // 🎈 随机位置
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    // 🎈 Generate unique keyframes for this bubble
    const animationName = `float-${Math.random().toString(36).substring(2, 8)}`;
    const keyframes = `
    @keyframes ${animationName} {
        0% { transform: translate(0, 0); }
        25% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px); }
        50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
        75% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px); }
        100% { transform: translate(0, 0); }
    }
`;

    // 🎈 Add the keyframes to a style element
    let styleSheet = document.styleSheets[0];
    if (!styleSheet) {
        const style = document.createElement("style");
        document.head.appendChild(style);
        styleSheet = style.sheet;
    }

    // 🎈 Assign random animation properties
    const duration = Math.random() * 5 + 3; // Random duration between 3-8 seconds
    const delay = Math.random() * 2; // Random delay between 0-2 seconds
    bubble.style.animation = `float ${duration}s infinite ease-in-out`;
    bubble.style.animationDelay = `${delay}s`;


    // ✅ 只添加一次
    document.getElementById("bubbleContainer").appendChild(bubble);

    // ✅ 只调用一次漂浮动画
    // moveBubble(bubble);

    // ✅ 60 秒后泡泡破裂
    //setTimeout(() => decayBubble(bubble, text, audioBase64), 60000);

}


// 🎤 录音
export function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        recordingStream = stream;
        allChunks = []; // 重置
        mediaRecorder = new MediaRecorder(stream);
        isRecording = true;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                allChunks.push(event.data);
                console.log("📦 录音片段大小:", event.data.size);
            }
        };

        mediaRecorder.onstop = async () => {

            console.log("🛑 录音结束，拼接音频...");
            const fullBlob = new Blob(allChunks, { type: 'audio/webm' });

            if (fullBlob.size === 0) {
                console.error("❌ 拼接后音频为空");
                return;
            }
            const userText = document.getElementById("bubbleText")?.value.trim();
            console.log("📤 用户输入文字：", userText);
            // ✅ 现在才传入 fullBlob 和 userText
            processAudioWithTone(fullBlob, userText);

        };

        mediaRecorder.start(5000); // 每 5 秒自动触发 ondataavailable
        console.log("🎙 开始录音，使用 chunk 模式");
    }).catch(err => {
        console.error("❌ 获取音频失败:", err);
    });
}



// 🎤 停止录音
export function stopRecording() {
    if (mediaRecorder && isRecording) {
        isRecording = false;
        mediaRecorder.stop();
        recordingStream.getTracks().forEach(track => track.stop()); // 释放资源
        console.log("🛑 停止录音并关闭麦克风");
    } else {
        console.warn("⚠️ 没有正在进行的录音");
    }
}

// 🎤 让网页加载 Firestore 里的 Base64 音频
export async function testToneEffect() {
    await Tone.start(); // 确保 AudioContext 启动

    // 创建合成器或基本声音源
    const synth = new Tone.Synth().toDestination();

    // 效果链条（和录音时一致）
    const pitchShift = new Tone.PitchShift(parseFloat(document.getElementById("pitchSlider").value));
    const bitCrusher = new Tone.BitCrusher(parseInt(document.getElementById("bitSlider").value));
    const delay = new Tone.FeedbackDelay(parseFloat(document.getElementById("delaySlider").value));
    const reverb = new Tone.Reverb({ decay: parseFloat(document.getElementById("reverbSlider").value) });

    // 链接效果
    synth.chain(pitchShift, bitCrusher, delay, reverb, Tone.Destination);

    // 播放音符（你可以改成任意声音）
    synth.triggerAttackRelease("C4", "1n");
}


// 🎤 让网页加载 Firestore 里的 Base64 音频
export async function loadBubbles() {
    console.log("🔄 正在加载 Firestore 数据...");

    // Grab all docs in "dream_bubbles"
    const querySnapshot = await getDocs(collection(db, "dream_bubbles"));
    querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docId = docSnap.id; // <-- define docId here!

        console.log("📌 Firestore 数据:", data, "DocId:", docId);

        // Now call createBubble with the actual docId
        createBubble(docId, data.text, data.audioBase64);
    });

    console.log("✅ 所有泡泡已加载完成");
}

// 🎵 Tone.js 变声并播放
async function processAudioWithTone(audioBlob, text = ""){

    console.log("🔄 Entering processAudioWithTone, decoding...");

    if (!audioBlob || audioBlob.size === 0) {
        console.error("❌ No audio data found!");
        return;
    }

    await Tone.start(); // Make sure Tone.js is started

    // 1) Decode into an AudioBuffer
    let arrayBuffer = await audioBlob.arrayBuffer();
    let originalBuffer = await Tone.context.decodeAudioData(arrayBuffer);
    console.log("✅ Decoded user recording into an AudioBuffer.");

    const userPitch = parseFloat(document.getElementById("pitchSlider").value);
    const userReverbTime = parseFloat(document.getElementById("reverbSlider").value);
    const userBitDepth = parseInt(document.getElementById("bitSlider").value);
    const userDelayTime = parseFloat(document.getElementById("delaySlider").value);

    const offlineDuration = originalBuffer.duration + 2;
    const renderedBuffer = await Tone.Offline(() => {
        const player = new Tone.Player(originalBuffer);
    
        // ✅ 创建 pitchShift 变调器
        const pitchShift = new Tone.PitchShift();
        pitchShift.pitch = userPitch;
    
        const reverb = new Tone.Reverb({ decay: userReverbTime });
        const bitCrusher = new Tone.BitCrusher(userBitDepth);
        const feedbackDelay = new Tone.FeedbackDelay({ delayTime: userDelayTime });
    
        // LFO
        const reverbWetLFO = new Tone.LFO({
            frequency: 0.1,
            min: 0.0,
            max: 1.0,
        });
        reverbWetLFO.connect(reverb.wet).start();
    
        const delayFeedbackLFO = new Tone.LFO({
            frequency: 0.2,
            min: 0.1,
            max: 0.9,
        });
        delayFeedbackLFO.connect(feedbackDelay.feedback).start();
    
        // ✅ 链接音频处理链条
        player.connect(pitchShift);
        pitchShift.connect(bitCrusher);
        bitCrusher.connect(feedbackDelay);
        feedbackDelay.connect(reverb);
        reverb.toDestination();
    
        player.start(0);
        Tone.Transport.start();
    }, offlineDuration);

    console.log("✅ Offline rendering complete. Duration:", renderedBuffer.duration);

    // 4) Convert renderedBuffer to WAV
    const processedAudioBlob = await bufferToBlob(renderedBuffer);
    if (!processedAudioBlob || processedAudioBlob.size === 0) {
        console.error("❌ Offline rendering produced an empty blob!");
        return;
    }
    console.log("✅ Got a processed WAV blob from offline render:", processedAudioBlob.size, "bytes");

    // 5) Store the processed audio in Firestore
    storeAudioInFirestore(processedAudioBlob, text);
}




//存储 Base64 到 Firestore
async function storeAudioInFirestore(audioBlob, text = "") {
    console.log("📢 进入 storeAudioInFirestore...");

    if (!audioBlob || audioBlob.size === 0) {
        console.error("❌ 录音文件为空，无法存入 Firestore！");
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async function () {
        const base64Audio = reader.result;

        if (!base64Audio) {
            console.error("❌ Base64 转换失败，录音不会存入 Firestore！");
            return;
        }

        try {
            console.log("🚀 尝试存入 Firestore...");
            const docRef = await addDoc(collection(db, "dream_bubbles"), {
                text: text || "🎵 变声录音",
                audioBase64: base64Audio,
                timestamp: new Date()
            });

            console.log("✅ Firestore 存入成功，文档 ID:", docRef.id);
        } catch (error) {
            console.error("❌ Firestore 存储失败:", error);
        }
    };
}


//helper function to delete bubbles
async function deleteBubbleDoc(docId, bubbleElement) {
    try {
        console.log("🗑 Deleting doc ID:", docId);
        await deleteDoc(doc(db, "dream_bubbles", docId));
        console.log("✅ Successfully deleted doc:", docId);

        // Remove the bubble from the page
        bubbleElement.remove();
    } catch (error) {
        console.error("❌ Failed to delete doc:", docId, error);
    }
}

// 🔄 页面加载完成
window.onload = function () {
    console.log("📌 页面加载完成，开始监听 Firestore 数据...");
};
*/