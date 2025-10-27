<?php

namespace App\Console\Commands;

use App\Models\Music;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CalculateMusicDurations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:calculate-durations {--force : Force recalculation for all music files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate and update duration for music files that have no duration set';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');

        $query = Music::query();

        if (! $force) {
            $query->whereNull('duration');
        }

        $musics = $query->get();
        $total = $musics->count();

        if ($total === 0) {
            $this->info('No music files need duration calculation.');

            return 0;
        }

        $this->info("Processing {$total} music file(s)...");
        $progressBar = $this->output->createProgressBar($total);
        $progressBar->start();

        $updated = 0;
        $failed = 0;

        foreach ($musics as $music) {
            if ($music->audio && Storage::disk('public')->exists($music->audio)) {
                $filePath = Storage::disk('public')->path($music->audio);
                $duration = $this->getAudioDuration($filePath);

                if ($duration !== null) {
                    $music->duration = $duration;
                    $music->save();
                    $updated++;
                } else {
                    $failed++;
                }
            } else {
                $failed++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✓ Successfully updated: {$updated}");
        if ($failed > 0) {
            $this->warn("✗ Failed: {$failed}");
        }

        return 0;
    }

    private function getAudioDuration(string $filePath): ?int
    {
        try {
            $getID3 = new \getID3;
            $fileInfo = $getID3->analyze($filePath);

            if (isset($fileInfo['playtime_seconds'])) {
                return (int) round($fileInfo['playtime_seconds']);
            }

            return null;
        } catch (\Exception $e) {
            $this->error("Failed to get duration for {$filePath}: " . $e->getMessage());

            return null;
        }
    }
}
