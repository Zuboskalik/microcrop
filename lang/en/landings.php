<?php

/*
|--------------------------------------------------------------------------
| Посадочные SEO-страницы — английский
|--------------------------------------------------------------------------
|
| Значения переопределяют config/landings.php через LandingController
| (см. ARCHITECTURE.md §2). Ключ — slug страницы, как в конфиге.
|
*/

return [

    'home' => [
        'title' => 'MicroCrop — Crop & Trim Videos Online for Free',
        'description' => 'Crop, trim and prepare videos for social media right in your browser — no server uploads. Fast, private, free.',
        'h1' => 'Crop and Trim Videos Online',
        'intro' => 'MicroCrop processes your video right in the browser: the file is never uploaded and is handled locally on your device.',
        'faq' => [
            ['q' => 'Do I need to upload my video to a server?', 'a' => 'No. All processing happens locally in your browser via FFmpeg.wasm — the file never leaves your device.'],
            ['q' => 'Is it free?', 'a' => 'Yes, the core features are free. On the free tier a small “microcrop” watermark is applied to the video; you can remove it with a one-time payment.'],
        ],
    ],

    'crop-video-online' => [
        'title' => 'Crop Video Online for Free — MicroCrop',
        'description' => 'Crop and trim videos right in your browser with no server uploads. No sign-up — open, crop, download.',
        'h1' => 'Crop Video Online',
        'intro' => 'Upload a video file, choose the crop area or the time range you need — then download the result. No installation and no sign-up.',
        'faq' => [
            ['q' => 'Which video formats are supported?', 'a' => 'MP4, MOV, WebM, AVI — as far as your browser can decode them.'],
            ['q' => 'Will the watermark stay on the video?', 'a' => 'On the free tier — yes, a small semi-transparent “microcrop” label in the corner. It can be removed with a one-time payment.'],
        ],
    ],

    'crop-for-reels' => [
        'title' => 'Crop Video for Reels/Shorts — 9:16 Online',
        'description' => 'Turn horizontal video into the vertical 9:16 format for Reels, Shorts, TikTok and VK Clips — right in your browser.',
        'h1' => 'Make Video Vertical for Reels',
        'intro' => 'Upload a horizontal video — the crop frame is already set to 9:16, all you have to do is pick the right area.',
        'preset' => [
            'label' => 'Reels / Shorts / TikTok / VK Clips',
        ],
        'faq' => [
            ['q' => 'Which format do Reels need?', 'a' => 'Vertical 9:16 — that is the preset selected on this page by default.'],
            ['q' => 'Can I choose my own crop area?', 'a' => 'Yes, the 9:16 frame can be moved freely around the picture to include the object you need.'],
        ],
    ],

    'crop-for-shorts' => [
        'title' => 'Crop Video for YouTube Shorts Online — 9:16',
        'description' => 'Crop video into the 9:16 format for YouTube Shorts with no installation, right in your browser.',
        'h1' => 'Make Video for YouTube Shorts',
        'intro' => 'A ready-made 9:16 preset for YouTube Shorts — just upload a video and set the crop area.',
        'preset' => [
            'label' => 'YouTube Shorts',
        ],
        'faq' => [
            ['q' => 'Is this format suitable for YouTube Shorts?', 'a' => 'Yes, 9:16 is the standard vertical format for Shorts.'],
            ['q' => 'Do I need to sign up?', 'a' => 'No, the tool works without registration and without uploading the video to a server.'],
        ],
    ],

    'crop-for-tiktok' => [
        'title' => 'Crop Video for TikTok Online — 9:16',
        'description' => 'Crop and trim video into the TikTok format (9:16) right in your browser, without a watermark — with PRO access.',
        'h1' => 'Make Video for TikTok',
        'intro' => 'The 9:16 format is already selected by default — upload a video and adjust the frame for TikTok.',
        'preset' => [
            'label' => 'TikTok',
        ],
        'faq' => [
            ['q' => 'Can I remove the watermark?', 'a' => 'Yes, with a one-time payment via Robokassa — after payment the “microcrop” label is not applied to the exported video.'],
            ['q' => 'Does the video keep its quality?', 'a' => 'Yes, encoding is done with settings that preserve the original frame quality.'],
        ],
    ],

    'crop-for-vk-clips' => [
        'title' => 'Crop Video for VK Clips Online — 9:16',
        'description' => 'Prepare vertical video for VK Clips quickly and for free — processing happens in your browser.',
        'h1' => 'Make Video for VK Clips',
        'intro' => 'Upload a video — the crop frame is already set to 9:16 for the VK Clips format.',
        'preset' => [
            'label' => 'VK Clips',
        ],
        'faq' => [
            ['q' => 'Is the format suitable for VK Clips?', 'a' => 'Yes, the vertical 9:16 format matches the VK Clips requirements.'],
            ['q' => 'How long does processing take?', 'a' => 'Usually from a few seconds to a couple of minutes — it depends on the video length and your device’s power.'],
        ],
    ],

    'trim-video' => [
        'title' => 'Trim Video by Time Online — MicroCrop',
        'description' => 'Cut a video to the segment you need by start and end time right in your browser, with no server uploads.',
        'h1' => 'Trim Video by Time',
        'intro' => 'Set the start and end points on the timeline — the rest of the video is discarded without any quality loss.',
        'preset' => [
            'label' => 'Trim by time',
        ],
        'faq' => [
            ['q' => 'Can I trim a video without changing the frame?', 'a' => 'Yes, this mode only changes the video length, the frame area stays the same.'],
            ['q' => 'Is there a length limit?', 'a' => 'The limit depends on the file size and your browser memory — very long videos may take more time to process.'],
        ],
    ],

    'circle-video-telegram' => [
        'title' => 'Make a Round Video for Telegram Online',
        'description' => 'Crop a video into a square and prepare it to be sent as a round video (video message) in Telegram.',
        'h1' => 'Make a Round Video for Telegram',
        'intro' => 'Crop the video into a 1:1 square — Telegram will display it as a round video message when sent.',
        'preset' => [
            'label' => 'Telegram video message',
        ],
        'faq' => [
            ['q' => 'Why a square and not a circle?', 'a' => 'Telegram itself crops a square video into a circle when sending it as a video message — preparing a 1:1 frame is enough.'],
            ['q' => 'Which size is best?', 'a' => 'Cropping into a square is enough — Telegram will adjust the exact resolution automatically.'],
        ],
    ],

    'crop-square-1-1' => [
        'title' => 'Crop Video into a 1:1 Square Online',
        'description' => 'Crop video into the 1:1 square format for Instagram and other social networks — right in your browser.',
        'h1' => 'Crop Video into a Square',
        'intro' => 'The 1:1 preset is already selected by default — upload a video and adjust the crop area to a square.',
        'preset' => [
            'label' => 'Square 1:1',
        ],
        'faq' => [
            ['q' => 'Which social networks does the 1:1 format fit?', 'a' => 'The square format works well for Instagram posts and most social feeds.'],
            ['q' => 'Can I choose a different aspect ratio?', 'a' => 'Yes, the editor page also offers 16:9, 9:16 presets and a free aspect ratio.'],
        ],
    ],

];
