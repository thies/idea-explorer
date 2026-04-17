import { useEffect, useRef, useMemo } from 'react'
import Plotly from 'plotly.js-dist-min'
import { CONDITIONS } from './Explorer'

// Zissou1 palette (matches the paper)
const ZISSOU2 = '#78B7C5'  // blueish — REE corpus
const ZISSOU5 = '#F21A00'  // red     — ideas

export default function ScatterPlot({ corpus, ideas, selectedIdea, onSelect }) {
  const containerRef = useRef(null)
  const initialized  = useRef(false)

  const traces = useMemo(() => {
    const ree    = corpus.filter(d => d.journal === 'REE')
    const others = corpus.filter(d => d.journal !== 'REE')

    const othersTr = {
      type: 'scattergl',
      mode: 'markers',
      name: 'Top journals',
      x: others.map(d => d.umap_x),
      y: others.map(d => d.umap_y),
      text: others.map(d => d.title ? d.title.slice(0, 80) : ''),
      hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
      customdata: others.map(d => `${d.journal || ''} ${d.year_int || ''}`),
      marker: { size: 3, color: '#cccccc', opacity: 0.45 },
      showlegend: false,
    }

    const reeTr = {
      type: 'scattergl',
      mode: 'markers',
      name: 'REE',
      x: ree.map(d => d.umap_x),
      y: ree.map(d => d.umap_y),
      text: ree.map(d => d.title ? d.title.slice(0, 80) : ''),
      hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
      customdata: ree.map(d => `REE ${d.year_int || ''}`),
      marker: { size: 3, color: ZISSOU2, opacity: 0.6 },
      showlegend: false,
    }

    // All ideas as a single red trace — condition filtering handled upstream
    const ideaTr = {
      type: 'scattergl',
      mode: 'markers',
      name: 'Ideas',
      x: ideas.map(d => d.umap_x),
      y: ideas.map(d => d.umap_y),
      customdata: ideas.map(d => d.id),
      text: ideas.map(d =>
        (d.research_question ? d.research_question.slice(0, 100) + '…' : '') +
        `<br><i>${CONDITIONS[d.condition]?.label || d.condition}</i>`
      ),
      hovertemplate: '%{text}<extra></extra>',
      marker: {
        size: 7,
        color: ZISSOU5,
        opacity: 0.75,
        line: { width: 0 },
      },
      showlegend: false,
    }

    return [othersTr, reeTr, ideaTr]
  }, [corpus, ideas])

  const layout = useMemo(() => ({
    autosize: true,
    margin: { t: 10, b: 10, l: 10, r: 10 },
    xaxis: { showgrid: false, zeroline: false, showticklabels: false },
    yaxis: { showgrid: false, zeroline: false, showticklabels: false },
    paper_bgcolor: '#fafafa',
    plot_bgcolor:  '#fafafa',
    hovermode: 'closest',
    dragmode:  'pan',
  }), [])

  const config = {
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toImage'],
    displaylogo: false,
    responsive: true,
  }

  // Initial render
  useEffect(() => {
    if (!containerRef.current) return
    Plotly.newPlot(containerRef.current, traces, layout, config).then(el => {
      initialized.current = true
      el.on('plotly_click', (eventData) => {
        const pt = eventData.points[0]
        const maybeId = pt.customdata
        if (typeof maybeId !== 'number') return
        onSelect(maybeId)
      })
    })
    return () => { if (containerRef.current) Plotly.purge(containerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render when filter changes
  useEffect(() => {
    if (!initialized.current || !containerRef.current) return
    Plotly.react(containerRef.current, traces, layout, config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
