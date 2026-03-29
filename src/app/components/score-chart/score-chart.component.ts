import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player';
import { Round } from '../../models/round';

interface ChartLine {
  color: string;
  name: string;
  points: { x: number; y: number; value: number }[];
  path: string;
}

@Component({
  selector: 'app-score-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.css'],
})
export class ScoreChartComponent implements OnChanges {
  @Input() players: Player[] = [];
  @Input() rounds: Round[] = [];

  lines: ChartLine[] = [];
  viewBox = '0 0 600 300';
  gridLines: { y: number; label: string }[] = [];
  roundLabels: { x: number; label: string }[] = [];

  private readonly padding = { top: 20, right: 20, bottom: 30, left: 45 };
  private readonly width = 600;
  private readonly height = 300;

  ngOnChanges() {
    this.buildChart();
  }

  private buildChart() {
    if (!this.players.length || !this.rounds.length) {
      this.lines = [];
      this.gridLines = [];
      this.roundLabels = [];
      return;
    }

    const p = this.padding;
    const chartW = this.width - p.left - p.right;
    const chartH = this.height - p.top - p.bottom;

    // Build cumulative scores per player
    const cumulativeScores: Record<string, number[]> = {};
    for (const player of this.players) {
      const scores: number[] = [0]; // start at 0
      let total = 0;
      for (const round of this.rounds) {
        total += round.scores[player.id] ?? 0;
        scores.push(total);
      }
      cumulativeScores[player.id] = scores;
    }

    // Find min/max
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const scores of Object.values(cumulativeScores)) {
      for (const s of scores) {
        if (s < minVal) minVal = s;
        if (s > maxVal) maxVal = s;
      }
    }

    // Add some padding to range
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.1;
    const yMax = maxVal + range * 0.1;

    const totalPoints = this.rounds.length + 1; // including start at 0

    const xScale = (i: number) => p.left + (i / (totalPoints - 1)) * chartW;
    const yScale = (v: number) => p.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

    // Build lines
    this.lines = this.players.map((player) => {
      const scores = cumulativeScores[player.id];
      const points = scores.map((v, i) => ({ x: xScale(i), y: yScale(v), value: v }));
      const path = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
      return { color: player.color, name: player.name, points, path };
    });

    // Grid lines (5 horizontal lines)
    const gridCount = 5;
    this.gridLines = [];
    for (let i = 0; i <= gridCount; i++) {
      const val = yMin + ((yMax - yMin) * i) / gridCount;
      this.gridLines.push({ y: yScale(val), label: Math.round(val).toString() });
    }

    // Round labels on x axis
    this.roundLabels = [];
    for (let i = 0; i < totalPoints; i++) {
      this.roundLabels.push({
        x: xScale(i),
        label: i === 0 ? '0' : `${i}`,
      });
    }
  }
}

