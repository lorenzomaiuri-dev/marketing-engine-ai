<script lang="ts">
  import { engineStore } from '../../../lib/stores/engineStore';
  import type { MarketingMix } from '../types';
  import * as Card from "@/lib/components/ui/card";
  import * as Tabs from "@/lib/components/ui/tabs";
  import { Button } from "@/lib/components/ui/button";
  import { Textarea } from "@/lib/components/ui/textarea";
  import { Label } from "@/lib/components/ui/label";
  import { Package, Tag, MapPin, Megaphone, Download } from "@lucide/svelte";

  let mix = $derived($engineStore.strategy.marketingMix);

  const pTheory = {
    product: "The solution to a consumer problem. Focus on unique value propositions.",
    price: "The value exchanged. Influenced by market positioning and perceived quality.",
    place: "Distribution channels. Where the product meets the customer (Digital or Physical).",
    promotion: "Communication strategy. How the value is conveyed to the target audience."
  };

  function updateMix(field: keyof MarketingMix, value: string) {
    const updatedMix = { ...mix, [field]: value };
    engineStore.updateStrategy({ marketingMix: updatedMix });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(mix, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marketing-mix.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Marketing Mix Export:", mix);
  }
</script>

<Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden mt-8">
  <Card.Header class="p-6 border-b border-slate-800/50 bg-slate-900/60 flex flex-row items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400">
        <Package class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <Card.Title class="text-xl font-bold text-white tracking-tight">
          Marketing Mix (4Ps)
        </Card.Title>
        <Card.Description class="text-slate-500 text-xs">Operationalize your strategy</Card.Description>
      </div>
    </div>
    <Button variant="outline" size="sm" class="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 transition-all" onclick={exportData} aria-label="Export Marketing Mix as JSON">
      <Download class="w-4 h-4 mr-2" />
      Export
    </Button>
  </Card.Header>
  <Card.Content class="p-6 md:p-8">
    <Tabs.Root value="product" class="w-full">
      <Tabs.List class="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-950 p-1 rounded-2xl border border-slate-800/50">
        <Tabs.Trigger value="product" class="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all py-2.5" aria-label="Product tab"><Package class="w-4 h-4 mr-2" aria-hidden="true" />Product</Tabs.Trigger>
        <Tabs.Trigger value="price" class="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all py-2.5" aria-label="Price tab"><Tag class="w-4 h-4 mr-2" aria-hidden="true" />Price</Tabs.Trigger>
        <Tabs.Trigger value="place" class="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all py-2.5" aria-label="Place tab"><MapPin class="w-4 h-4 mr-2" aria-hidden="true" />Place</Tabs.Trigger>
        <Tabs.Trigger value="promotion" class="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all py-2.5" aria-label="Promotion tab"><Megaphone class="w-4 h-4 mr-2" aria-hidden="true" />Promotion</Tabs.Trigger>
      </Tabs.List>

      {#each Object.keys(mix) as p}
        <Tabs.Content value={p} class="space-y-6 pt-8 animate-in fade-in zoom-in-95 duration-300">
          <div class="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svelte:component this={p === 'product' ? Package : p === 'price' ? Tag : p === 'place' ? MapPin : Megaphone} class="w-12 h-12 text-blue-400" />
            </div>
            <h4 class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
               Strategic Theory
            </h4>
            <p class="text-sm text-blue-100/80 leading-relaxed max-w-2xl">
              {pTheory[p as keyof typeof pTheory]}
            </p>
          </div>

          <div class="space-y-3">
            <Label for={p} class="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
              Your {p} Strategy
            </Label>
            <Textarea 
              id={p}
              placeholder={`Define how your ${p} strategy addresses SWOT factors...`} 
              value={mix[p as keyof MarketingMix]}
              oninput={(e) => updateMix(p as keyof MarketingMix, e.currentTarget.value)}
              class="bg-slate-950/50 border-slate-800 rounded-2xl min-h-[160px] text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50 transition-all p-4 leading-relaxed"
              aria-label={`${p} strategy description`}
            />
          </div>
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  </Card.Content>
</Card.Root>