import { Specialization } from '../models/index.js';

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Retrieve all active medical specializations with optional search
 */
export const getAllSpecializations = async (queryParams = {}) => {
  const { search } = queryParams;

  const query = {};
  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { keywords: { $in: [new RegExp(escapeRegex(search.trim()), 'i')] } },
    ];
  }

  const specializations = await Specialization.find(query)
    .sort({ name: 1 })
    .select('_id name description category icon keywords');

  return specializations.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    description: s.description,
    category: s.category,
    icon: s.icon,
    keywords: s.keywords,
  }));
};
