// src/store/slices/incidentSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";

type Incident = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  created_by: string;
};

type IncidentState = {
  items: Incident[];
  selectedIncident: Incident | null;
  loading: boolean;
};

const initialState: IncidentState = {
  items: [],
  selectedIncident: null,
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

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setIncidents, setSelectedIncident } = incidentSlice.actions;

export default incidentSlice.reducer;
