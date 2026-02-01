<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler,
    type ChartConfiguration
  } from 'chart.js';
  import type { BusinessModel, SimulationResult } from '../types';
  import { calculateSimulation } from '../lib/simulator';
  import * as Card from "@/lib/components/ui/card";
  import { Input } from "@/lib/components/ui/input";
  import { Label } from "@/lib/components/ui/label";
  import { Badge } from "@/lib/components/ui/badge";
  import { Separator } from "@/lib/components/ui/separator";
  import { Rocket, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle2 } from "@lucide/svelte";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler
  );

  let model = $state<BusinessModel>({
    cac: 150,
    arpu: 45,
    cogs: 5,
    churnRate: 7,
    months: 24
  });

  let result = $derived(calculateSimulation(model));

  let canvas: HTMLCanvasElement;
  let chart: ChartJS;

  function updateChart() {
    if (!chart) return;
    
    chart.data.labels = result.monthlyProjection.map(d => `M${d.month}`);
    chart.data.datasets[0].data = result.monthlyProjection.map(d => d.profit);
    chart.data.datasets[1].data = Array(model.months).fill(0);
    chart.update();
  }

  $effect(() => {
    // Re-run when result changes
    if (result) {
      updateChart();
    }
  });

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: result.monthlyProjection.map(d => `M${d.month}`),
        datasets: [
          {
            label: 'Cumulative Profit/Loss',
            data: result.monthlyProjection.map(d => d.profit),
            fill: true,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: 'Break Even',
            data: Array(model.months).fill(0),
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: '#1e293b',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context: any) => `Profit: $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#64748b',
              callback: (value: any) => `$${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxRotation: 0
            }
          }
        }
      }
    };

    chart = new ChartJS(ctx, config);
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Inputs Panel -->
  <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden col-span-1">
    <Card.Header class="p-6 border-b border-slate-800/50 bg-slate-900/60">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Rocket class="w-5 h-5" />
        </div>
        <div>
          <Card.Title class="text-xl font-bold text-white tracking-tight">Simulator Inputs</Card.Title>
          <Card.Description class="text-slate-500 text-xs">Adjust your model parameters</Card.Description>
        </div>
      </div>
    </Card.Header>
    <Card.Content class="p-6 space-y-6">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label for="cac" class="text-xs font-bold text-slate-400 uppercase tracking-widest">CAC ($)</Label>
            <span class="text-emerald-400 font-mono text-sm">${model.cac}</span>
          </div>
          <input type="range" id="cac" bind:value={model.cac} min="0" max="1000" step="10" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          <p class="text-[10px] text-slate-500 italic">Cost to acquire one customer</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label for="arpu" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly ARPU ($)</Label>
            <span class="text-emerald-400 font-mono text-sm">${model.arpu}</span>
          </div>
          <input type="range" id="arpu" bind:value={model.arpu} min="0" max="500" step="5" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          <p class="text-[10px] text-slate-500 italic">Average Revenue Per User</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label for="cogs" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly COGS ($)</Label>
            <span class="text-emerald-400 font-mono text-sm">${model.cogs}</span>
          </div>
          <input type="range" id="cogs" bind:value={model.cogs} min="0" max="200" step="1" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          <p class="text-[10px] text-slate-500 italic">Cost of Goods Sold (per user)</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label for="churn" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Churn (%)</Label>
            <span class="text-rose-400 font-mono text-sm">{model.churnRate}%</span>
          </div>
          <input type="range" id="churn" bind:value={model.churnRate} min="0" max="50" step="0.5" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" />
          <p class="text-[10px] text-slate-500 italic">Percentage of customers lost each month</p>
        </div>
      </div>

      <Separator class="bg-slate-800/50" />

      <div class="space-y-2">
        <Label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sustainability Status</Label>
        {#if result.isSustainable}
          <div class="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 class="w-4 h-4" />
            <span class="text-xs font-semibold">Model is Sustainable</span>
          </div>
        {:else}
          <div class="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle class="w-4 h-4" />
            <span class="text-xs font-semibold">Model is at Risk</span>
          </div>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Visualization & Key Metrics -->
  <div class="lg:col-span-2 space-y-8">
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lifetime Value (LTV)</span>
          <span class="text-2xl font-bold text-white">${result.ltv.toFixed(2)}</span>
          <div class="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
            <TrendingUp class="w-3 h-3" />
            <span>Projected Revenue</span>
          </div>
        </div>
      </Card.Root>

      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LTV / CAC Ratio</span>
          <span class="text-2xl font-bold {result.ltvCacRatio >= 3 ? 'text-emerald-400' : 'text-rose-400'}">
            {result.ltvCacRatio.toFixed(2)}x
          </span>
          <Badge variant="outline" class="mt-2 w-fit text-[10px] bg-slate-950 border-slate-800">
            Target: > 3.0x
          </Badge>
        </div>
      </Card.Root>

      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payback Period</span>
          <span class="text-2xl font-bold text-white">
            {result.paybackPeriod ? `${result.paybackPeriod} months` : 'Never'}
          </span>
          <div class="flex items-center gap-1 text-[10px] text-blue-400 mt-2">
            <DollarSign class="w-3 h-3" />
            <span>Time to recover CAC</span>
          </div>
        </div>
      </Card.Root>
    </div>

    <!-- Chart -->
    <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden h-[400px] flex flex-col">
      <Card.Header class="p-6 border-b border-slate-800/50 bg-slate-900/60 flex flex-row items-center justify-between">
        <div>
          <Card.Title class="text-lg font-bold text-white tracking-tight">Cumulative Unit Economics</Card.Title>
          <Card.Description class="text-slate-500 text-xs">Projection over {model.months} months</Card.Description>
        </div>
        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Profit</span>
          </div>
        </div>
      </Card.Header>
      <Card.Content class="p-6 flex-grow relative">
        <div class="absolute inset-0 p-6">
          <canvas bind:this={canvas}></canvas>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<style>
  /* Custom slider styling to match the theme */
  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  }

  input[type='range']#churn::-webkit-slider-thumb {
    border-color: #f43f5e;
    box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
  }
</style>