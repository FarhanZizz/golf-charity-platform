import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCharities({ featuredOnly = false } = {}) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase.from("charities").select("*").eq("is_active", true).order("name");
      if (featuredOnly) query = query.eq("is_featured", true);
      const { data } = await query;
      setCharities(data || []);
      setLoading(false);
    };
    fetch();
  }, [featuredOnly]);

  return { charities, loading };
}
