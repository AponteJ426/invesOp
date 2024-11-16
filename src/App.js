import React, { useState } from 'react';
import { FiPlusCircle, FiColumns } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import RelationshipGraph from './grapich';

function hungarianMethod(costMatrix) {
  const n = costMatrix.length;
  const m = costMatrix[0].length;

  let matrixSteps = [];
  let matrix = costMatrix.map(row => row.map(value => value));

  // Añadimos la matriz inicial
  matrixSteps.push({
    step: "Matriz inicial",
    matrix: matrix.map(row => [...row])
  });

  // Paso 1: Reducción de filas
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < m; j++) {
      matrix[i][j] -= rowMin;
    }
  }
  matrixSteps.push({
    step: "Reducción de filas",
    matrix: matrix.map(row => [...row])
  });

  // Paso 2: Reducción de columnas
  for (let j = 0; j < m; j++) {
    const colMin = Math.min(...matrix.map(row => row[j]));
    for (let i = 0; i < n; i++) {
      matrix[i][j] -= colMin;
    }
  }
  matrixSteps.push({
    step: "Reducción de columnas",
    matrix: matrix.map(row => [...row])
  });

  // Paso 3: Asignación inicial
  const assigned = Array(n).fill(-1);
  const markedRows = Array(n).fill(false);
  const markedCols = Array(m).fill(false);

  const markZeros = () => {
    let changed = false;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] === 0 && !markedRows[i] && !markedCols[j]) {
          assigned[i] = j;
          markedCols[j] = true;
          markedRows[i] = true;
          changed = true;
        }
      }
    }
    return changed;
  };

  while (markZeros()) {
    matrixSteps.push({
      step: "Marcado de ceros",
      matrix: matrix.map(row => [...row]),
      assignments: [...assigned]
    });
  }

  // Paso 4: Ajustar matriz si no se cubren todos los ceros
  let iterations = 0;
  while (assigned.includes(-1) && iterations < 100) {
    const minUncovered = Math.min(
      ...matrix.flatMap((row, i) =>
        row.filter((_, j) => !markedCols[j] && !markedRows[i])
      )
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (markedRows[i] && markedCols[j]) {
          matrix[i][j] += minUncovered;
        } else if (!markedRows[i] && !markedCols[j]) {
          matrix[i][j] -= minUncovered;
        }
      }
    }

    matrixSteps.push({
      step: "Ajuste de matriz",
      matrix: matrix.map(row => [...row])
    });

    markedRows.fill(false);
    markedCols.fill(false);
    markZeros();
    iterations++;
  }

  const optimalAssignment = assigned.map((j, i) => ({
    row: i + 1,
    col: j + 1,
    cost: costMatrix[i][j]
  }));

  const minimumCost = optimalAssignment.reduce((sum, item) => sum + item.cost, 0);

  return { optimalAssignment, minimumCost, matrixSteps };
}

// Función para transformar los ceros en Infinity
const processMatrix = (matrix) => {
  return matrix.map((row) =>
    row.map((value) => (value === 0 ? Infinity : value))
  );
};

// Implementación del método de Vogel
function vogelMethod(costMatrix) {
  const matrix = costMatrix.map(row => [...row]);
  const n = matrix.length;
  const m = matrix[0].length;
  let matrixSteps = [];

  // Añadimos la matriz inicial
  matrixSteps.push({
    step: "Matriz inicial",
    matrix: matrix.map(row => [...row])
  });

  let remainingRows = Array.from({ length: n }, (_, i) => i);
  let remainingCols = Array.from({ length: m }, (_, i) => i);
  let allocation = [];
  let totalCost = 0;

  while (remainingRows.length > 0 && remainingCols.length > 0) {
    // Calcular penalizaciones
    const rowPenalties = calculatePenalties(matrix, remainingRows, remainingCols, true);
    const colPenalties = calculatePenalties(matrix, remainingRows, remainingCols, false);

    matrixSteps.push({
      step: "Cálculo de penalizaciones",
      matrix: matrix.map(row => [...row]),
      rowPenalties,
      colPenalties
    });

    // Encontrar la mayor penalización
    const maxRowPenalty = Math.max(...rowPenalties.map(p => p.penalty));
    const maxColPenalty = Math.max(...colPenalties.map(p => p.penalty));

    let selectedRow, selectedCol;

    if (maxRowPenalty >= maxColPenalty) {
      const rowIndex = rowPenalties.findIndex(p => p.penalty === maxRowPenalty);
      selectedRow = remainingRows[rowIndex];
      selectedCol = findMinCostCell(matrix, selectedRow, remainingCols);
    } else {
      const colIndex = colPenalties.findIndex(p => p.penalty === maxColPenalty);
      selectedCol = remainingCols[colIndex];
      selectedRow = findMinCostCell(matrix, selectedCol, remainingRows, false);
    }

    // Registrar la asignación
    allocation.push({
      row: selectedRow + 1,
      col: selectedCol + 1,
      cost: matrix[selectedRow][selectedCol]
    });

    totalCost += matrix[selectedRow][selectedCol];

    // Eliminar fila y columna usadas
    remainingRows = remainingRows.filter(row => row !== selectedRow);
    remainingCols = remainingCols.filter(col => col !== selectedCol);

    matrixSteps.push({
      step: "Asignación realizada",
      matrix: matrix.map(row => [...row]),
      allocation: [...allocation]
    });
  }

  return { allocation, totalCost, matrixSteps };
}

// Funciones auxiliares para el método de Vogel
function calculatePenalties(matrix, rows, cols, isRow) {
  return (isRow ? rows : cols).map(i => {
    const values = (isRow ? cols : rows).map(j =>
      isRow ? matrix[i][j] : matrix[j][i]
    );
    const sorted = [...values].sort((a, b) => a - b);
    return {
      index: i,
      penalty: sorted[1] - sorted[0] || 0
    };
  });
}

function findMinCostCell(matrix, fixedIndex, indices, isRow = true) {
  return indices.reduce((minIndex, currentIndex) => {
    const currentCost = isRow ? matrix[fixedIndex][currentIndex] : matrix[currentIndex][fixedIndex];
    const minCost = isRow ? matrix[fixedIndex][minIndex] : matrix[minIndex][fixedIndex];
    return currentCost < minCost ? currentIndex : minIndex;
  }, indices[0]);
}



const App = () => {
  const [costMatrix, setCostMatrix] = useState([[]]);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [matrixSteps, setMatrixSteps] = useState([]);


  const handleCostMatrixChange = (row, col, value) => {
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      const updatedMatrix = [...costMatrix];
      updatedMatrix[row][col] = parsedValue;
      setCostMatrix(updatedMatrix);
    } else {
      alert("Por favor, ingrese un número válido.");
    }
  };

  const addRow = () => {
    const newRow = Array(costMatrix[0].length).fill(0);
    setCostMatrix([...costMatrix, newRow]);
  };

  const addColumn = () => {
    const updatedMatrix = costMatrix.map((row) => [...row, 0]);
    setCostMatrix(updatedMatrix);
  };

  const runHungarianMethod = () => {
    const { optimalAssignment, minimumCost, matrixSteps: steps } = hungarianMethod(costMatrix);
    setResults({
      method: 'Método Húngaro',
      optimalAssignment,
      minimumCost,
    });
    setMatrixSteps(steps);

    const chartData = optimalAssignment.map((item, index) => ({
      name: `Asignación ${index + 1}`,
      cost: item.cost,
    }));
    setChartData(chartData);
  };


  const runVogelMethod = () => {
    const { allocation, totalCost, matrixSteps: steps } = vogelMethod(costMatrix);
    setResults({
      method: "Método de Vogel",
      optimalAssignment: allocation,
      minimumCost: totalCost,
    });
    setMatrixSteps(steps);

    const chartData = allocation.map((item, index) => ({
      name: `Asignación ${index + 1}`,
      cost: item.cost,
    }));
    setChartData(chartData);
  };

  const renderMatrixSteps = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolución de la Matriz en Cada Paso</h3>
      <div className="space-y-6">
        {matrixSteps.map((step, index) => (
          <div key={`step-${index}`} className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-md font-semibold mb-2">{step.step}</h4>
            <table className="border border-gray-300 w-full text-center rounded-lg">
              <tbody>
                {step.matrix.map((row, rowIndex) => (
                  <tr key={`step-${index}-row-${rowIndex}`}>
                    {row.map((value, colIndex) => (
                      <td
                        key={`step-${index}-row-${rowIndex}-col-${colIndex}`}
                        className={`border p-2 ${value === 0 ? 'bg-green-100' : ''
                          }`}
                      >
                        {value === Infinity ? '∞' : value.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {step.rowPenalties && (
              <div className="mt-2">
                <p className="font-semibold">Penalizaciones de filas:</p>
                {step.rowPenalties.map((p, i) => (
                  <span key={i} className="mr-4">Fila {p.index + 1}: {p.penalty.toFixed(2)}</span>
                ))}
              </div>
            )}
            {step.colPenalties && (
              <div className="mt-2">
                <p className="font-semibold">Penalizaciones de columnas:</p>
                {step.colPenalties.map((p, i) => (
                  <span key={i} className="mr-4">Columna {p.index + 1}: {p.penalty.toFixed(2)}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleReset = () => {
    setCostMatrix([[]]);
    setResults(null);
    setChartData([]);
  }

  return (
    <div className="flex flex-col h-screen items-center  backdrop-blur-lg bg-center bg-cover bg-[url('../public/back.jpg')]">
      <div className="flex  items-center justify-center p-6  rounded-full">
        <h1 className="text-5xl font-bold leading-none text-gray-900 md:text-6xl lg:text-7xl mx-auto mb-8 text-center">
          <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent ">
            SolveOps
          </span>
        </h1>
      </div>
      <div className="flex-col bg-opacity-30 backdrop-blur-lg p-6 overflow-y-auto rounded-lg rounded-rg shadow-xl w-1/2 text-gray-800 h-[75%] max-h-[70vh]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Matriz de Costos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-center rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold"> </th>
                  {costMatrix[0].map((_, index) => (
                    <th key={`header-${index}`} className="p-3 font-semibold">Columna {index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costMatrix.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="bg-white hover:bg-blue-50 transition duration-150">
                    <td className="p-3 font-semibold">Fila {rowIndex + 1}</td>
                    {row.map((value, colIndex) => (
                      <td key={`cell-${rowIndex}-${colIndex}`} className="p-3 border">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-300 text-center"
                          value={value.toString()}
                          onChange={(e) => handleCostMatrixChange(rowIndex, colIndex, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              className="flex items-center bg-white hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-full transition duration-200 transform hover:scale-105"
              onClick={addRow}
            >
              <FiPlusCircle className="mr-2" /> Agregar Fila
            </button>
            <button
              className="flex items-center bg-white hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-full transition duration-200 transform hover:scale-105"
              onClick={addColumn}
            >
              <FiColumns className="mr-2" /> Agregar Columna
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
            onClick={runHungarianMethod}
          >
            Método Húngaro
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 ml-4"
            onClick={runVogelMethod}
          >
            Método de Vogel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 ml-4"
            onClick={handleReset}
          >
            Limpiar
          </button>
        </div>

        {results && (
          <div className="mt-10 bg-indigo-100 rounded-lg p-6 shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">{results.method} Resultados</h2>
            <p className="text-lg font-bold text-gray-700">Costo Mínimo Total: ${results.minimumCost}</p>
            <h3 className="text-lg font-semibold mt-4">Asignación Óptima</h3>
            <ul className="list-disc ml-6 text-gray-600">
              {results.optimalAssignment.map((item, index) => (
                <li key={index} className="my-1">
                  {item.row} asignada a {item.col} con un costo de ${item.cost}
                </li>
              ))}
            </ul>
            <div>
              <h1>Gráfico de Asignaciones</h1>
              {console.log(results.optimalAssignment)}
              {console.log(costMatrix)}
              <RelationshipGraph assignments={results.optimalAssignment} costMatrix={costMatrix} />
            </div>
          </div>
        )}
        {renderMatrixSteps()}
      </div>
    </div>
  );
};

export default App;
