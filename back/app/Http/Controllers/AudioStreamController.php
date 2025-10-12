<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AudioStreamController extends Controller
{
    public function stream(Request $request, $filename)
    {
        $filename = ltrim($filename, '/');
        if (str_starts_with($filename, 'storage/')) {
            $filename = substr($filename, strlen('storage/'));
        }
        $filename = str_replace(['../', '..\\'], '', $filename);

        $disk = Storage::disk('public');
        if (! $disk->exists($filename)) {
            Log::warning('Audio file not found for streaming', [
                'filename' => $filename,
                'resolved_path' => method_exists($disk, 'path') ? $disk->path($filename) : null,
            ]);
            abort(404);
        }

        $fullPath = $disk->path($filename);
        $size = (int) $disk->size($filename);
        $start = 0;
        $end = $size > 0 ? $size - 1 : 0;
        $status = 200;

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mime = match ($ext) {
            'mp3' => 'audio/mpeg',
            'm4a' => 'audio/mp4',
            'aac' => 'audio/aac',
            'wav' => 'audio/wav',
            'ogg' => 'audio/ogg',
            'oga' => 'audio/ogg',
            default => 'audio/mpeg',
        };

        $range = $request->header('Range');
        if ($size > 0 && $range && preg_match('/bytes=(\d*)-(\d*)/i', $range, $m)) {
            $reqStart = ($m[1] !== '') ? (int) $m[1] : null;
            $reqEnd = ($m[2] !== '') ? (int) $m[2] : null;

            if ($reqStart === null && $reqEnd !== null) {
                $start = max(0, $size - $reqEnd);
                $end = $size - 1;
            } else {
                $start = max(0, min($size - 1, $reqStart ?? 0));
                $end = ($reqEnd !== null) ? min($reqEnd, $size - 1) : $size - 1;
            }

            if ($start > $end || $start >= $size) {
                return response('', 416, [
                    'Content-Range' => "bytes */{$size}",
                    'Accept-Ranges' => 'bytes',
                    'Content-Type' => $mime,
                ]);
            }

            $status = 206;
        }

        $length = ($end - $start + 1);

        $headers = [
            'Content-Type' => $mime,
            'Accept-Ranges' => 'bytes',
            'Content-Length' => (string) $length,
        ];
        if ($status === 206) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$size}";
        }

        if ($request->isMethod('HEAD')) {
            return response('', $status, $headers);
        }

        while (ob_get_level() > 0) {
            @ob_end_clean();
        }

        $stream = static function () use ($fullPath, $start, $length) {
            $fp = fopen($fullPath, 'rb');
            if ($fp === false) {
                return;
            }
            try {
                fseek($fp, $start);
                $remaining = $length;
                $chunk = 8192;
                while ($remaining > 0 && ! feof($fp)) {
                    $read = fread($fp, min($chunk, $remaining));
                    if ($read === false) {
                        break;
                    }
                    $remaining -= strlen($read);
                    echo $read;
                    flush();
                }
            } finally {
                fclose($fp);
            }
        };

        return response()->stream($stream, $status, $headers);
    }
}
