import { useReducer } from 'react';
import { EDITOR_ITEM_TYPES } from './EditorItemType';

const initStates = editorId => ({
	editorId,
	text: '',
	focused: false,
	selectedIndex: [-1, -1],
	lines: [],
	selectedType: EDITOR_ITEM_TYPES.SPAN,
});

const rumorReducer = (state, { type, payload }) => {
	switch (type) {
		case 'reset':
			return {
				...initStates(),
				editorId: state.editorId,
			};
		case 'set':
			return {
				...state,
				...payload,
			};
		default:
			return state;
	}
};

export const useRumorReducer = editorId => {
	const [state, setStateAll] = useReducer(rumorReducer, editorId, initStates);
	return { state, setStateAll };
};
