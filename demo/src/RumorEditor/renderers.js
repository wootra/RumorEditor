import React from 'react';

export const renderVisibleContent = (
	idx,
	{ type, parentKey = 'root', props, children = [] }
) => {
	const key = parentKey + '_' + idx;
	const myChildren =
		typeof children === 'string'
			? children
			: children.map((child, ci) => {
					return renderVisibleContent(ci, { ...child, parentKey: key });
			  });
	if (!props.className) {
		//if there is no className defined, set default className
		props = { ...props, className: 'default' };
	}
	return React.createElement(
		type,
		{
			...props,
			key,
		},
		myChildren
	);
};
