var initialState = {
  page:  1,
  pages: 1,
  tag:   '',
  tags:  [],
  feed:  [],

  tags_error:   false,
  feed_error:   false,
  feed_loading: false,
  tags_loading: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'LOAD_FEED': {
      return {

      }
    }

    case LOAD_TAGS: {
      return {

      }
    }

    default: {
      return state;
    }
  }
}