import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RelationshipGraph = ( { costMatrix,assignments }) => {
  const svgRef = useRef();


  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = 80;

    // Configurar el título
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Gráfico de Asignaciones");

    const rowNodes = costMatrix.length;
    const colNodes = costMatrix[0].length;

    // Escalas
    const rowScale = d3.scalePoint()
      .domain(d3.range(1, rowNodes + 1))
      .range([margin, height - margin]);

    const colScale = d3.scalePoint()
      .domain(d3.range(1, colNodes + 1))
      .range([margin, height - margin]);

    // Dibujar las líneas primero (para que estén detrás de los nodos)
    const lineGroup = svg.append("g");
    assignments.forEach(assignment => {
      lineGroup.append("line")
        .attr("x1", margin)
        .attr("y1", rowScale(assignment.row))
        .attr("x2", width - margin)
        .attr("y2", colScale(assignment.col))
        .style("stroke", "#ccc")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "4,4");

      // Añadir el costo en el medio de la línea
      lineGroup.append("text")
        .attr("x", (margin + (width - margin)) / 2)
        .attr("y", (rowScale(assignment.row) + colScale(assignment.col)) / 2)
        .attr("dy", -5)
        .attr("text-anchor", "middle")
        .style("fill", "#666")
        .style("font-size", "12px")
        .text(assignment.cost);
    });

    // Nodos origen (izquierda)
    const sourceGroup = svg.append("g");
    sourceGroup.selectAll("circle")
      .data(d3.range(1, rowNodes + 1))
      .enter()
      .append("circle")
      .attr("cx", margin)
      .attr("cy", d => rowScale(d))
      .attr("r", 8)
      .style("fill", "#69b3a2")
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Etiquetas origen
    sourceGroup.selectAll("text")
      .data(d3.range(1, rowNodes + 1))
      .enter()
      .append("text")
      .attr("x", margin - 20)
      .attr("y", d => rowScale(d))
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .text(d => `S${d}`);

    // Nodos destino (derecha)
    const targetGroup = svg.append("g");
    targetGroup.selectAll("circle")
      .data(d3.range(1, colNodes + 1))
      .enter()
      .append("circle")
      .attr("cx", width - margin)
      .attr("cy", d => colScale(d))
      .attr("r", 8)
      .style("fill", "#4c8df5")
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Etiquetas destino
    targetGroup.selectAll("text")
      .data(d3.range(1, colNodes + 1))
      .enter()
      .append("text")
      .attr("x", width - margin + 20)
      .attr("y", d => colScale(d))
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .text(d => `D${d}`);

  }, [costMatrix, assignments]);

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default RelationshipGraph;