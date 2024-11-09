import { parseAsString, useQueryState } from "nuqs";

export const useTabState = () => {
	return useQueryState("tab", parseAsString.withDefault("public"));
};
