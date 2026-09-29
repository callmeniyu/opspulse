import type { Incident } from "@/types/incidentTypes";
import { IncidentMember } from "@/types/memberTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IncidentState = {
  items: Incident[];
  selectedIncident: Incident | null;
  selectedIncidentMembers: IncidentMember[];
  loading: boolean;
};

const initialState: IncidentState = {
  items: [],
  selectedIncident: null,
  selectedIncidentMembers: [],
  loading: false,
};

const incidentSlice = createSlice({
  name: "incidents",

  initialState,

  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.items = action.payload;
    },

    addIncident: (state, action: PayloadAction<Incident>) => {
      state.items.unshift(action.payload);
    },

    setSelectedIncident: (state, action: PayloadAction<Incident | null>) => {
      state.selectedIncident = action.payload;
    },

    updateIncidentInStore: (state, action: PayloadAction<Incident>) => {
      const index = state.items.findIndex((incident) => incident.id === action.payload.id);

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      if (state.selectedIncident?.id === action.payload.id) {
        state.selectedIncident = action.payload;
      }
    },

    setIncidentMembers: (state, action: PayloadAction<IncidentMember[]>) => {
      state.selectedIncidentMembers = action.payload;
    },

    addIncidentMember: (state, action: PayloadAction<IncidentMember>) => {
      state.selectedIncidentMembers.push(action.payload);
    },

    removeIncidentMember: (state, action: PayloadAction<string>) => {
      state.selectedIncidentMembers = state.selectedIncidentMembers.filter((member) => member.id !== action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setIncidents, setSelectedIncident, setLoading, setIncidentMembers, addIncidentMember, removeIncidentMember } = incidentSlice.actions;

export default incidentSlice.reducer;
