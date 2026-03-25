import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("draws")
        .select("*")
        .eq("status", "published")
        .order("month", { ascending: false });
      setDraws(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { draws, loading };
}

export function useMyDrawEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("draw_entries")
        .select("*, draws(month, winning_numbers, status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEntries(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { entries, loading };
}

// Admin: fetch ALL draws including pending/simulated
export function useAllDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("month", { ascending: false });
    setDraws(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { draws, loading, refetch: fetch };
}
