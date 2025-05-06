export const useUiState = defineStore("ui", () => {
  const isPanelDragging = ref(false);
  const isContentDropdownShown = ref(false);

  const persistState = reactive(getLayoutDefaults());

  function getLayoutDefaults() {
    return {
      panelDocs: 40,
      panelEditor: 60,
      panelPreview: 40,
      panelFileTree: 20,
      showTerminal: true,
      showEditor: true,
    };
  }

  function resetLayout() {
    Object.assign(persistState, getLayoutDefaults());
  }

  const stateCookie = useCookie<Partial<typeof persistState>>(
    "nuxt-playground-ui-state",
    { default: () => getLayoutDefaults(), watch: true },
  );

  // update and sync cookie with the reactive state
  Object.assign(persistState, getLayoutDefaults(), { ...stateCookie.value });
  watch(persistState, () => {
    stateCookie.value = { ...persistState };
  });

  function toggleTerminal() {
    persistState.showTerminal = !persistState.showTerminal;
  }

  return {
    isPanelDragging,
    isContentDropdownShown,
    toggleTerminal,
    resetLayout,
    ...toRefs(persistState),
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUiState, import.meta.hot));
