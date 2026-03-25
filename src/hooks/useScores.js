import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export function useScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(5);

    if (!error) setScores(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const addScore = async (score, playedAt) => {
    if (!user) return;
    const { error } = await supabase.from("scores").insert({
      user_id: user.id,
      score: Number(score),
      played_at: playedAt,
    });
    if (error) {
      toast.error(error.message || "Failed to add score");
      return false;
    }
    toast.success("Score added!");
    await fetchScores();
    return true;
  };

  const updateScore = async (id, score, playedAt) => {
    const { error } = await supabase
      .from("scores")
      .update({ score: Number(score), played_at: playedAt })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update score");
      return false;
    }
    toast.success("Score updated!");
    await fetchScores();
    return true;
  };

  const deleteScore = async (id) => {
    const { error } = await supabase.from("scores").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete score");
      return false;
    }
    toast.success("Score removed");
    await fetchScores();
    return true;
  };

  return { scores, loading, addScore, updateScore, deleteScore, refetch: fetchScores };
}
