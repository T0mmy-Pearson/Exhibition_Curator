// Fetch all exhibitions (optionally only public) && 
export const fetchAllExhibitions = async (isPublicOnly: boolean = false, limit: number = 100, offset: number = 0) => {
  try {
    const users = await User.find({}, 'exhibitions username firstName lastName')
      .skip(offset)
      .limit(limit);
    const allExhibitions = users.flatMap(user =>
      user.exhibitions
        .filter(exhibition => !isPublicOnly || exhibition.isPublic)
        .map(exhibition => ({
          ...exhibition.toObject(),
          curator: {
            username: user.username,
            fullName: user.fullName
          }
        }))
    );
    return allExhibitions;
  } catch (error) {
    console.error('Error fetching all exhibitions:', error);
    throw new Error('Failed to fetch all exhibitions');
  }
};
import { User } from './User';

interface ExhibitionData {
  title: string;
  description?: string;
  theme?: string;
  isPublic?: boolean;
  tags?: string[];
  coverImageUrl?: string;
}

// Fetch all exhibitions for a user
export const fetchUserExhibitions = async (userId: string) => {
  try {
    const user = await User.findById(userId).select('exhibitions');
    if (!user) {
      throw new Error('User not found');
    }
    return user.exhibitions;
  } catch (error) {
    console.error('Error fetching user exhibitions:', error);
    throw new Error('Failed to fetch exhibitions');
  }
};

// Fetch public exhibitions (for sharing)
export const fetchPublicExhibitions = async (limit: number = 20, offset: number = 0) => {
  try {
    const users = await User.find(
      { 'exhibitions.isPublic': true },
      { 'exhibitions.$': 1, username: 1, firstName: 1, lastName: 1 }
    )
    .skip(offset)
    .limit(limit);

    const publicExhibitions = users.flatMap(user => 
      user.exhibitions
        .filter(exhibition => exhibition.isPublic)
        .map(exhibition => ({
          ...exhibition.toObject(),
          curator: {
            username: user.username,
            fullName: user.fullName
          }
        }))
    );

    return publicExhibitions;
  } catch (error) {
    console.error('Error fetching public exhibitions:', error);
    throw new Error('Failed to fetch public exhibitions');
  }
};

// Fetch single exhibition by ID
export const fetchExhibitionById = async (userId: string, exhibitionId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const exhibition = user.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
    if (!exhibition) {
      throw new Error('Exhibition not found');
    }

    return exhibition;
  } catch (error) {
    console.error('Error fetching exhibition by ID:', error);
    throw new Error('Exhibition not found');
  }
};

// Fetch public exhibition by shareable link
export const fetchExhibitionByShareableLink = async (shareableLink: string) => {
  try {
    const user = await User.findOne(
      { 'exhibitions.shareableLink': shareableLink, 'exhibitions.isPublic': true },
      { 'exhibitions.$': 1, username: 1, firstName: 1, lastName: 1 }
    );

    if (!user || !user.exhibitions.length) {
      throw new Error('Exhibition not found or not public');
    }

    const exhibition = user.exhibitions[0];
    return {
      ...exhibition.toObject(),
      curator: {
        username: user.username,
        fullName: user.fullName
      }
    };
  } catch (error) {
    console.error('Error fetching exhibition by shareable link:', error);
    throw new Error('Exhibition not found');
  }
};

// Create new exhibition
export const insertExhibition = async (userId: string, exhibitionData: ExhibitionData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate required fields
    if (!exhibitionData.title || exhibitionData.title.trim().length === 0) {
      throw new Error('Exhibition title is required');
    }

    // Generate shareable link if exhibition is public
    const shareableLink = exhibitionData.isPublic 
      ? generateShareableLink(exhibitionData.title, userId)
      : undefined;

    const newExhibitionData = {
      title: exhibitionData.title,
      description: exhibitionData.description || '',
      theme: exhibitionData.theme || '',
      isPublic: exhibitionData.isPublic || false,
      tags: exhibitionData.tags || [],
      coverImageUrl: exhibitionData.coverImageUrl || '',
      shareableLink,
      artworks: [], // Start with empty artworks array
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await user.addExhibition(newExhibitionData);
    
    // Return the newly created exhibition
    const updatedUser = await User.findById(userId);
    const newExhibition = updatedUser?.exhibitions[updatedUser.exhibitions.length - 1];
    
    return newExhibition;
  } catch (error) {
    console.error('Error creating exhibition:', error);
    throw new Error('Failed to create exhibition');
  }
};

// Update exhibition
export const updateExhibitionById = async (userId: string, exhibitionId: string, updates: Partial<ExhibitionData>) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const exhibition = user.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
    if (!exhibition) {
      throw new Error('Exhibition not found');
    }

    // Update exhibition fields
    Object.assign(exhibition, updates);
    
    // Update shareable link if publicity status changed
    if (updates.isPublic !== undefined) {
      if (updates.isPublic) {
        exhibition.shareableLink = generateShareableLink(exhibition.title, userId);
      } else {
        exhibition.shareableLink = undefined;
      }
    }

    exhibition.updatedAt = new Date();
    user.updatedAt = new Date();

    await user.save();
    return exhibition;
  } catch (error) {
    console.error('Error updating exhibition:', error);
    throw new Error('Failed to update exhibition');
  }
};

// Delete exhibition
export const removeExhibitionById = async (userId: string, exhibitionId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const exhibitionIndex = user.exhibitions.findIndex(ex => ex._id?.toString() === exhibitionId);
    if (exhibitionIndex === -1) {
      throw new Error('Exhibition not found');
    }

    user.exhibitions.splice(exhibitionIndex, 1);
    user.updatedAt = new Date();

    await user.save();
  } catch (error) {
    console.error('Error deleting exhibition:', error);
    throw new Error('Failed to delete exhibition');
  }
};

// Add artwork to exhibition
export const addArtworkToExhibition = async (userId: string, exhibitionId: string, artworkData: any) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.addArtworkToExhibition(exhibitionId, artworkData);
    
    // Return updated exhibition
    const updatedUser = await User.findById(userId);
    const exhibition = updatedUser?.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
    return exhibition;
  } catch (error) {
    console.error('Error adding artwork to exhibition:', error);
    throw error;
  }
};

// Remove artwork from exhibition
export const removeArtworkFromExhibition = async (userId: string, exhibitionId: string, artworkId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.removeArtworkFromExhibition(exhibitionId, artworkId);
    
    // Return updated exhibition
    const updatedUser = await User.findById(userId);
    const exhibition = updatedUser?.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
    return exhibition;
  } catch (error) {
    console.error('Error removing artwork from exhibition:', error);
    throw error;
  }
};

// Search exhibitions by title or theme
export const searchExhibitions = async (query: string, isPublicOnly: boolean = false, limit: number = 20, offset: number = 0) => {
  try {
    const searchRegex = new RegExp(query, 'i');
    const matchConditions: any = {
      $or: [
        { 'exhibitions.title': searchRegex },
        { 'exhibitions.description': searchRegex },
        { 'exhibitions.theme': searchRegex },
        { 'exhibitions.tags': { $in: [searchRegex] } }
      ]
    };

    if (isPublicOnly) {
      matchConditions['exhibitions.isPublic'] = true;
    }

    const users = await User.find(matchConditions)
      .select('exhibitions username firstName lastName')
      .skip(offset)
      .limit(limit);

    const matchingExhibitions = users.flatMap(user => 
      user.exhibitions
        .filter(exhibition => {
          const matchesQuery = 
            exhibition.title.match(searchRegex) ||
            exhibition.description?.match(searchRegex) ||
            exhibition.theme?.match(searchRegex) ||
            exhibition.tags?.some((tag: string) => tag.match(searchRegex));
          
          return matchesQuery && (!isPublicOnly || exhibition.isPublic);
        })
        .map(exhibition => ({
          ...exhibition.toObject(),
          curator: {
            username: user.username,
            fullName: user.fullName
          }
        }))
    );

    return matchingExhibitions;
  } catch (error) {
    console.error('Error searching exhibitions:', error);
    throw new Error('Failed to search exhibitions');
  }
};

// Helper function to generate shareable links
function generateShareableLink(title: string, userId: string): string {
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const timestamp = Date.now().toString(36);
  const userIdShort = userId.substring(userId.length - 6);
  
  return `${slug}-${userIdShort}-${timestamp}`;
}