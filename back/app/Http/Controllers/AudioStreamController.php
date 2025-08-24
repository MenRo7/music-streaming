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

        if (!$disk->exists($filename)) {
            Log::warning('Audio file not found for streaming', [
                'filename' => $filename,
                'resolved_path' => method_exists($disk, 'path') ? $disk->path($filename) : null,
            ]);
            abort(404);
        }

        $fullPath = $disk->path($filename);
        $size     = $disk->size($filename);
        $start    = 0;
        $end      = $size - 1;
        $length   = $size;
        $status   = 200;
        $range = $request->header('Range');
        if ($range && preg_match('/bytes=(\d+)-(\d*)/i', $range, $m)) {
            $start = (int) $m[1];
            if ($m[2] !== '') {
                $end = min((int) $m[2], $size - 1);
            }
            $length = $end - $start + 1;
            $status = 206;
        }

        $headers = [
            'Content-Type'   => 'audio/mpeg',
            'Accept-Ranges'  => 'bytes',
            'Content-Length' => $length,
        ];
        if ($status === 206) {
            $headers['Content-Range'] = "bytes $start-$end/$size";
        }
        while (ob_get_level() > 0) { @ob_end_clean(); }

        $stream = function () use ($fullPath, $start, $length) {
            $fp = fopen($fullPath, 'rb');
            fseek($fp, $start);

            $remaining = $length;
            $chunk = 8192;
            while ($remaining > 0 && !feof($fp)) {
                $read = fread($fp, min($chunk, $remaining));
                $remaining -= strlen($read);
                echo $read;
                @ob_flush(); flush();
            }
            fclose($fp);
        };

        return response()->stream($stream, $status, $headers);
    }
}
