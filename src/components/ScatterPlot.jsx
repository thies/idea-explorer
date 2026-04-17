import { useEffect, useRef, useState, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import { CONDITIONS } from './Explorer'

export default function ScatterPlot({ corpus, ideas, selectedIdea, onSelect }) {
  const containerRef = useRef(null)
  const plotRef      = useRef(null)
  const initialized  = useRef(false)

  // Build traces from data
  const traces = useMemo(() => {
    // Corpus: single grey trace
    const corpusTr = {
      type: 'scattergl',
      mode: 'markers',
      name: 'Corpus',
      x: corpus.map(d => d.umap_x),
      y: corpus.map(d => d.umap_y),
      text: corpus.map(d => d.title ? d.title.slice(0, 80) : ''),
      hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
      customdata: corpus.map(d => `${d.journal || ''} ${d.year_int || ''}`),
      marker: {
        size: 3,
        color: '#d0d0d0',
        opacity: 0.5,
      },
      showlegend: false,
    }

    // Ideas: one trace per condition (so hover/click gives condition context)
    const condTraces = Object.entries(CONDITIONS).map(([cond, { label, color }]) => {
      const subset = ideas.filter(d => d.condition === cond)
      return {
        type: 'scattergl',
        mode: 'markers',
        name: label,
        x: subset.map(d => d.umap_x),
        y: subset.map(d => d.umap_y),
        customdata: subset.map(d => d.id),
        text: subset.map(d =>
          d.research_question ? d.research_question.slice(0, 100) + '…' : ''
        ),
        hovertemplate: '<b>%{text}</b><extra>' + label + '</extra>',
        marker: {
          size: 6,
          color,
          opacity: 0.75,
          line: { width: 0 },
        },
        showlegend: false,
      }
    })

    return [corpusTr, ...condTraces]
  }, [corpus, ideas])

  const layout = useMemo(() => ({
    autosize: true,
    margin: { t: 10, b: 10, l: 10, r: 10 },
    xaxis: {
      showgrid: false, zeroline: false, showticklabels: false,
      fixedrange: false,
    },
    yaxis: {
      showgrid: false, zeroline: false, showticklabels: false,
      fixedrange: false,
    },
    paper_bgcolor: '#fafafa',
    plot_bgcolor: '#fafafa',
    hovermode: 'closest',
    dragmode: 'pan',
  }), [])

  const config = {
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toImage'],
    modeBarButtonsToAdd: [],
    displaylogo: false,
    responsive: true,
  }

  // Initial render
  useEffect(() => {
    if (!containerRef.current) return
    Plotly.newPlot(containerRef.current, traces, layout, config).then(el => {
      plotRef.current = el
      initialized.current = true

      el.on('plotly_click', (eventData) => {
        const pt = eventData.points[0]
        if (pt.data.type !== 'scattergl') return
        // Corpus trace has no customdata integer id
        const maybeId = pt.customdata
        if (typeof maybeId !== 'number') return
        onSelect(maybeId)
      })
    })
    return () => {
      if (containerRef.current) Plotly.purge(containerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once

  // Update traces when ideas/corpus change (e.g. filter)
  useEffect(() => {
    if (!initialized.current || !containerRef.current) return
    Plotly.react(containerRef.current, traces, layout, config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
