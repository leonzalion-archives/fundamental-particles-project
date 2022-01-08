import arrayShuffle from 'array-shuffle';
import chunk from 'lodash.chunk';
import type { AppActionThis } from './types';
import { createAppState } from './state';
import type { ParticleAnswerGrid, ParticleId } from '~/types/particles';
import { orderedParticleAnswerGrid } from '~/utils/particle-grid';

type SetParticleGridProps = {
	particleId: ParticleId;
	row: number;
	column: number;
};

export function randomizeAnswerGrid(this: AppActionThis) {
	this.particleAnswerGrid = arrayShuffle(
		orderedParticleAnswerGrid
	) as ParticleAnswerGrid;
}

export function getAnswerParticleIds(
	this: AppActionThis,
	{
		row,
		column,
	}: {
		row: number;
		column: number;
	}
): ParticleId[] {
	const particlesRow = this.particleAnswerGrid[row];
	if (particlesRow === undefined) throw new Error(`Invalid row: ${row}`);

	return [particlesRow[column]!].flat();
}

export function getRow(this: AppActionThis, rowIndex: number) {
	if (this.particleGrid[rowIndex] === undefined) {
		throw new Error(`Invalid row: ${rowIndex}`);
	}

	return this.particleGrid[rowIndex]!;
}

export function getParticleGridCell(
	this: AppActionThis,
	{ column, row }: { row: number; column: number }
) {
	const cellRow = this.getRow(row);
	return cellRow[column];
}

export function setParticleGridCell(
	this: AppActionThis,
	{ particleId, column, row }: SetParticleGridProps
) {
	const cellRow = this.getRow(row);
	cellRow[column] = particleId;
}

export function unsetParticleGridCell(
	this: AppActionThis,
	{ column, row }: { row: number; column: number }
) {
	const cellRow = this.getRow(row);
	cellRow[column] = undefined;
}

export function checkAnswers(this: AppActionThis) {
	this.highlightErrors = true;
	for (let rowIndex = 0; rowIndex < this.particleGrid.length; rowIndex += 1) {
		const row = this.getRow(rowIndex);
		for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
			const currentGridParticle = this.getParticleGridCell({
				row: rowIndex,
				column: columnIndex,
			});
			if (
				currentGridParticle === undefined ||
				!this.getAnswerParticleIds({
					row: rowIndex,
					column: columnIndex,
				}).includes(currentGridParticle)
			) {
				return false;
			}
		}
	}

	this.stopTimer();
	this.isComplete = true;
	return true;
}

export function startGame(this: AppActionThis) {
	// In hard mode, randomize the particleAnswerGrid
	if (this.hardMode) {
		const newOrder = arrayShuffle(orderedParticleAnswerGrid.flat(1));
		this.particleAnswerGrid = chunk(newOrder, 5);
	}

	this.startTimer();
}

export function resetGame(this: AppActionThis) {
	this.clearTimer();
	const newState = createAppState();

	this.isComplete = false;
	this.highlightErrors = false;
	this.particleGrid = newState.particleGrid;
	this.particleDock = newState.particleDock;

	this.startTimer();
}

export function startTimer(this: AppActionThis) {
	if (this.timer === undefined) {
		this.timer = setInterval(() => {
			this.secondsElapsed += 1;
		}, 1000);
	}
}

export function stopTimer(this: AppActionThis) {
	if (this.timer !== undefined) clearInterval(this.timer);
}

export function clearTimer(this: AppActionThis) {
	this.stopTimer();
	this.secondsElapsed = 0;
}
